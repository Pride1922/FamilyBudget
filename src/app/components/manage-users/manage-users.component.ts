import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../services/user.service';
import { MFAService } from '../../services/mfa.service';
import { User } from '../../models/user.model';
import { MatTableDataSource } from '@angular/material/table';
import { AddUserDialogComponent } from '../add-user-dialog/add-user-dialog.component';
import { EditUserDialogComponent } from '../edit-user-dialog/edit-user-dialog.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component'; // Adjust the path as per your project structure
import { MatSort, Sort } from '@angular/material/sort';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit, AfterViewInit {
  users: MatTableDataSource<User>;
  filteredUsers = new MatTableDataSource<User>();
  displayedColumns: string[] = ['id', 'username', 'email', 'role', 'isActive', 'actions'];
  searchText: string = '';

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  constructor(
    private userService: UserService,
    private mfaService: MFAService,
    public dialog: MatDialog
  ) {
    this.users = new MatTableDataSource<User>([]);
    this.filteredUsers = new MatTableDataSource<User>([]);
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(
      (users: User[]) => {
        this.users.data = users.map(user => ({
          ...user,
          isMfaEnabled: user.mfa_enabled
        }));
        this.users.sort = this.sort;
        this.applyFilter(); // Call applyFilter after loading data
      },
      (error) => {
        console.error('Error loading users:', error);
      }
    );
  }

  applyFilter(): void {
    const filterValue = this.searchText.trim().toLowerCase();

    // Check if users data is loaded
    if (this.users.data.length > 0) {
      // Filter users data based on filterValue
      const filteredData = this.users.data.filter(user =>
        user.username.toLowerCase().includes(filterValue)
        || user.id.toString().includes(filterValue)
        || user.email.toLowerCase().includes(filterValue)
        || user.role.toLowerCase().includes(filterValue)
      );

      // Assign filtered data to filteredUsers
      this.filteredUsers.data = filteredData;
    } else {
      // If no users are loaded, reset filteredUsers to empty
      this.filteredUsers.data = [];
    }
  }

  clearSearch(): void {
    this.searchText = '';
    this.applyFilter();
  }

  disableMFA(userId: number) {
    this.mfaService.disableMFA(userId).subscribe(
      response => {
        this.loadUsers(); // Refresh the user list
      },
      error => {
        console.error('Error disabling MFA', error);
      }
    );
  }

  openAddUserDialog(): void {
    const dialogRef = this.dialog.open(AddUserDialogComponent, {
      width: '400px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.addUser(result).subscribe(() => {
          this.loadUsers();
        });
      }
    });
  }

  editUser(user: User): void {
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      width: '400px',
      data: { user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.updateUser(result).subscribe(() => {
          this.loadUsers();
        });
      }
    });
  }

  deleteUser(userId: number): void {
    this.openConfirmationDialog(userId);
  }

  openConfirmationDialog(userId: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: 'Are you sure you want to delete this user?',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.deleteUser(userId).subscribe(() => {
          this.loadUsers(); // Reload users after deletion
        });
      }
    });
  }

  toggleUserStatus(user: User): void {
    user.isActive = !user.isActive;
    this.userService.updateUser(user).subscribe(() => {
      this.loadUsers();
    });
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
      this.applyFilter(); // Re-apply filter after sorting
    }
  }
}

function compare(a: number | string | boolean, b: number | string | boolean, isAsc: boolean): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
