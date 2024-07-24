import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IconsService } from '../../services/icons.service';

@Component({
  selector: 'app-icon-search',
  templateUrl: './icon-search.component.html',
  styleUrls: ['./icon-search.component.css']
})
export class IconSearchComponent implements OnInit {
  icons: string[] = [];
  searchForm: FormGroup;

  constructor(private iconsService: IconsService, private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      searchTerm: ['']
    });
  }

  ngOnInit(): void {
    this.searchForm.get('searchTerm')?.valueChanges.subscribe(term => {
      this.iconsService.searchIcons(term).subscribe(icons => this.icons = icons);
    });
  }
}
