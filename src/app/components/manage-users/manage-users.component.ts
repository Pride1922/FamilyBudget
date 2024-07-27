import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../services/user.service';
import { MFAService } from '../../services/mfa.service';
import { AuthService } from '../../services/auth.service'; 
import { User } from '../../models/user.model';
import { MatTableDataSource } from '@angular/material/table';
import { AddUserDialogComponent } from '../add-user-dialog/add-user-dialog.component';
import { EditUserDialogComponent } from '../edit-user-dialog/edit-user-dialog.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component'; 
import { MatSort, Sort } from '@angular/material/sort';
import { SnackbarService } from '../../services/snackbar.service'; 
import { TranslateService } from '@ngx-translate/core'; 
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit, AfterViewInit, OnDestroy {
  users: MatTableDataSource<User> = new MatTableDataSource<User>([]);
  filteredUsers = new MatTableDataSource<User>();
  displayedColumns: string[] = ['id', 'username', 'email', 'role', 'isActive', 'actions'];
  searchText: string = '';
  loggedInUser: any;
  private destroy$ = new Subject<void>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  constructor(
    private userService: UserService,
    private mfaService: MFAService,
    private authService: AuthService, 
    public dialog: MatDialog,
    private snackBar: SnackbarService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.authService.getLoggedInUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => this.loggedInUser = user);
  }

  ngAfterViewInit(): void {
    this.users.sort = this.sort;
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(
      (users: User[]) => {
        this.users.data = users.map(user => ({
          ...user,
          isMfaEnabled: user.mfa_enabled
        }));
        this.applyFilter();
      },
      error => this.handleError(error, 'MANAGE_USERS.LOAD_ERROR')
    );
  }

  applyFilter(): void {
    const filterValue = this.searchText.trim().toLowerCase();
    this.filteredUsers.data = this.users.data.filter(user =>
      user.username.toLowerCase().includes(filterValue)
      || user.id.toString().includes(filterValue)
      || user.email.toLowerCase().includes(filterValue)
      || user.role.toLowerCase().includes(filterValue)
    );
  }

  clearSearch(): void {
    this.searchText = '';
    this.applyFilter();
  }

  disableMFA(userId: number): void {
    this.mfaService.disableMFA(userId).subscribe(
      () => this.refreshUserList(),
      error => this.handleError(error, 'MANAGE_USERS.MFA_DISABLED_ERROR')
    );
  }

  openAddUserDialog(): void {
    this.openDialog(AddUserDialogComponent, {});
  }

  editUser(user: User): void {
    this.openDialog(EditUserDialogComponent, { user });
  }

  deleteUser(userId: number): void {
    this.openConfirmationDialog(userId);
  }

  openConfirmationDialog(userId: number): void {
    this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: this.translate.instant('MANAGE_USERS.DELETE_CONFIRM'),
    }).afterClosed().subscribe(result => {
      if (result) {
        this.userService.deleteUser(userId).subscribe(
          () => this.refreshUserList(),
          error => this.handleError(error, 'MANAGE_USERS.DELETE_ERROR')
        );
      }
    });
  }

  toggleUserStatus(user: User): void {
    user.isActive = !user.isActive;
    this.userService.updateUser(user).subscribe(
      () => this.refreshUserList(),
      error => this.handleError(error, 'MANAGE_USERS.STATUS_UPDATE_ERROR')
    );
  }

  onSortChange(sortState: Sort): void {
    if (sortState.direction) {
      const sortedData = this.users.data.slice().sort((a, b) => {
        const isAsc = sortState.direction === 'asc';
        switch (sortState.active) {
          case 'id': return compare(a.id, b.id, isAsc);
          case 'username': return compare(a.username, b.username, isAsc);
          case 'email': return compare(a.email, b.email, isAsc);
          case 'role': return compare(a.role, b.role, isAsc);
          case 'isActive': return compare(a.isActive, b.isActive, isAsc);
          default: return 0;
        }
      });
      this.users.data = sortedData;
      this.applyFilter();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private openDialog(component: any, data: any, width: string = '400px'): void {
    this.dialog.open(component, { width, data })
      .afterClosed().subscribe(result => {
        if (result) {
          this.refreshUserList();
        }
      });
  }

  private handleError(error: any, messageKey: string): void {
    console.error(error);
    this.snackBar.showError(this.translate.instant(messageKey));
  }

  private refreshUserList(): void {
    this.loadUsers();
  }
}

// Utility function for sorting
function compare(a: number | string | boolean, b: number | string | boolean, isAsc: boolean): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
