import { Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCamera, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MOVIE_ADMIN_SERVICE } from '../../../constants/injection.constant';
import { IMovieAdminServiceInterface } from '../../../services/movieAdmin/movie-admin.interface';
import { MovieViewModel } from '../../../models/movie/movie-view-model';

interface ScheduleSlot {
  id: string;
  time: string;
}

@Component({
  selector: 'app-updatemovie',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './updatemovie.component.html',
  styleUrl: './updatemovie.component.css'
})
export class UpdatemovieComponent implements OnInit {
  public faCamera: IconDefinition = faCamera;
  public form!: FormGroup;
  public errorMessage: string = '';
  public showErrorMessage: boolean = false;
  private isCurrentlyShowing: boolean = false;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  initialAvatarUrl: string | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  avatarChanged = false;

  public availableGenres: string[] = [
    'Action', 'Adventure', 'Animation', 'Biography', 'Comedy',
    'Crime', 'Drama', 'Family', 'Fantasy', 'History',
    'Horror', 'Musical', 'Mystery', 'Romance', 'SciFi',
    'Sport', 'Thriller', 'War', 'Western'
  ];

  public availableSchedules: ScheduleSlot[] = [
    { id: '100e8400-e29b-41d4-a716-446655440000', time: '8:00' },
    { id: '100e8400-e29b-41d4-a716-446655440004', time: '9:00' },
    { id: '100e8400-e29b-41d4-a716-446655440008', time: '10:00' },
    { id: '100e8400-e29b-41d4-a716-446655440012', time: '11:00' },
    { id: '100e8400-e29b-41d4-a716-446655440016', time: '12:00' },
    { id: '100e8400-e29b-41d4-a716-446655440024', time: '14:00' },
    { id: '100e8400-e29b-41d4-a716-446655440032', time: '16:00' },
    { id: '100e8400-e29b-41d4-a716-446655440040', time: '18:00' },
    { id: '100e8400-e29b-41d4-a716-446655440044', time: '19:00' },
    { id: '100e8400-e29b-41d4-a716-446655440048', time: '20:00' },
    { id: '100e8400-e29b-41d4-a716-446655440056', time: '22:00' },
    { id: '100e8400-e29b-41d4-a716-446655440062', time: '24:00' }
  ];

  public cinemaRoomsMapping: { [key: string]: string } = {
    'Room 1': '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    'Room 2': '3fa85f64-5717-4562-b3fc-2c963f66afa7',
    'Room 3': '3fa85f64-5717-4562-b3fc-2c963f66afa8',
    'Room 4': '3fa85f64-5717-4562-b3fc-2c963f66afa9',
    'Room 5': '3fa85f64-5717-4562-b3fc-2c963f66afb0'
  };

  avatarToDisplay(): string | ArrayBuffer | null {
    return this.previewUrl || this.initialAvatarUrl;
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
      this.avatarChanged = true;
    }
  }

  @Input() public selectedItem!: MovieViewModel | undefined | null;
  @Output() close = new EventEmitter<void>();
  @Output() dataChanged = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  constructor(
    @Inject(MOVIE_ADMIN_SERVICE) private readonly movieAdminService: IMovieAdminServiceInterface
  ) { }

  ngOnInit(): void {
    this.createForm();

    if (this.selectedItem) {
      this.initialAvatarUrl = this.selectedItem.posterUrl || null;
      this.updateForm();
      this.checkIfCurrentlyShowing();
    }
  }

  private checkIfCurrentlyShowing(): void {
    if (this.selectedItem) {
      const currentDate = new Date();
      const releasedDate = new Date(this.selectedItem.releasedDate);
      const endDate = new Date(this.selectedItem.endDate);
      // Remove time component for date comparison
      currentDate.setHours(0, 0, 0, 0);
      releasedDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      this.isCurrentlyShowing = currentDate >= releasedDate && currentDate <= endDate;
      if (this.isCurrentlyShowing) {
        this.showErrorMessage = true;
        this.errorMessage = 'This movie is currently being shown and cannot be updated';
        this.form.disable(); // Disable the form to prevent changes
      }
    }
  }

  public createForm() {
    this.form = new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.maxLength(50)
      ]),
      duration: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]+$')
      ]),
      origin: new FormControl('', [
        Validators.required,
        Validators.maxLength(50)
      ]),
      description: new FormControl('', [
        Validators.required,
        Validators.maxLength(500)
      ]),
      director: new FormControl('', [
        Validators.required,
        Validators.maxLength(100)
      ]),
      actor: new FormControl('', [
        Validators.required,
        Validators.maxLength(200)
      ]),
      version: new FormControl('_2D', [
        Validators.required
      ]),
      posterUrl: new FormControl(null),
      status: new FormControl('NowShowing', [
        Validators.required
      ]),
      releasedDate: new FormControl(null, [
        Validators.required
      ]),
      endDate: new FormControl(null, [
        Validators.required
      ]),
      genres: new FormArray([], [
        Validators.required,
        Validators.minLength(1)
      ]),
      cinemaroomId: new FormControl('3fa85f64-5717-4562-b3fc-2c963f66afa6', [
        Validators.required
      ]),
      schedules: new FormArray([], [
        Validators.required,
        Validators.minLength(1)
      ])
    });

    this.form.valueChanges.subscribe(() => {
      if (!this.isCurrentlyShowing) {
        this.showErrorMessage = false;
      }
    });
  }

  isGenreSelected(genre: string): boolean {
    const genresArray = this.form.get('genres') as FormArray;
    return genresArray.controls.some(control => control.value === genre);
  }

  isScheduleSelected(scheduleId: string): boolean {
    const schedulesArray = this.form.get('schedules') as FormArray;
    return schedulesArray.controls.some(control => control.value === scheduleId);
  }

  onGenreChange(event: any, genre: string) {
    const genres = this.form.get('genres') as FormArray;

    if (event.target.checked) {
      genres.push(new FormControl(genre));
    } else {
      const index = genres.controls.findIndex(x => x.value === genre);
      if (index >= 0) {
        genres.removeAt(index);
      }
    }
  }

  onScheduleChange(event: any, scheduleId: string) {
    const schedules = this.form.get('schedules') as FormArray;
    if (event.target.checked) {
      schedules.push(new FormControl(scheduleId));
    } else {
      const index = schedules.controls.findIndex(x => x.value === scheduleId);
      if (index >= 0) {
        schedules.removeAt(index);
      }
    }
  }

  private formatDate(date: string | Date): string {
    if (!date) return '';

    const d = new Date(date);
    return d.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  public updateForm(): void {
    if (!this.selectedItem) return;

    const genresArray = this.form.get('genres') as FormArray;
    const schedulesArray = this.form.get('schedules') as FormArray;

    while (genresArray.length) {
      genresArray.removeAt(0);
    }

    while (schedulesArray.length) {
      schedulesArray.removeAt(0);
    }

    if (this.selectedItem.genres && Array.isArray(this.selectedItem.genres)) {
      this.selectedItem.genres.forEach(genre => {
        genresArray.push(new FormControl(genre));
      });
    }

    if (this.selectedItem.showtimes && Array.isArray(this.selectedItem.showtimes) && this.selectedItem.showtimes.length > 0) {
      const firstDay = this.selectedItem.showtimes[0].showDate;
      const firstDayShowtimes = this.selectedItem.showtimes.filter(showtime =>
        showtime.showDate === firstDay
      );

      const startTimes = firstDayShowtimes.map(showtime => {
        const timeString = showtime.startTime;
        const hours = timeString.toString().substring(0, 2).replace(/^0+/, '');
        const minutes = timeString.toString().substring(3, 5);
        return `${hours}:${minutes}`;
      });

      this.availableSchedules.forEach(schedule => {
        if (startTimes.includes(schedule.time)) {
          schedulesArray.push(new FormControl(schedule.id));
        }
      });
    }

    let statusValue: string;
    switch (this.selectedItem.status) {
      case 1:
        statusValue = 'NowShowing';
        break;
      case 2:
        statusValue = 'ComingSoon';
        break;
      case 3:
        statusValue = 'NotAvailable';
        break;
      default:
        statusValue = 'NowShowing';
    }

    let versionValue: string;
    switch (this.selectedItem.version) {
      case 1:
        versionValue = '_2D';
        break;
      case 2:
        versionValue = '_3D';
        break;
      default:
        versionValue = '_2D';
    }

    let cinemaRoom: string;
    switch (this.selectedItem.cinemaRooms[0]) {
      case 'Room 1':
        cinemaRoom = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
        break;
      case 'Room 2':
        cinemaRoom = '3fa85f64-5717-4562-b3fc-2c963f66afa7';
        break;
      case 'Room 3':
        cinemaRoom = '3fa85f64-5717-4562-b3fc-2c963f66afa8';
        break;
      case 'Room 4':
        cinemaRoom = '3fa85f64-5717-4562-b3fc-2c963f66afa9';
        break;
      case 'Room 5':
        cinemaRoom = '3fa85f64-5717-4562-b3fc-2c963f66afb0';
        break;
      default:
        cinemaRoom = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    }

    this.form.patchValue({
      name: this.selectedItem.name,
      duration: this.selectedItem.duration,
      origin: this.selectedItem.origin,
      description: this.selectedItem.description,
      director: this.selectedItem.director,
      actor: this.selectedItem.actors,
      version: versionValue,
      status: statusValue,
      releasedDate: this.formatDate(this.selectedItem.releasedDate),
      endDate: this.formatDate(this.selectedItem.endDate),
      cinemaroomId: cinemaRoom,
      genres: this.selectedItem.genres,
      schedules: this.selectedItem.selectedShowTimeSlots,
      posterUrl: this.selectedItem.posterUrl
    });
  }

  public onSubmit(): void {
    if (this.isCurrentlyShowing) {
      this.showErrorMessage = true;
      this.errorMessage = 'This movie is currently being shown and cannot be updated';
      return;
    }

    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.showErrorMessage = true;
      this.errorMessage = 'Please fill in all the required fields';
      return;
    }

    if (!this.selectedItem && !this.selectedFile) {
      this.showErrorMessage = true;
      this.errorMessage = 'Please upload a movie poster';
      return;
    }

    const duration = Number(this.form.get('duration')?.value);
    if (isNaN(duration) || duration <= 0 || !Number.isInteger(duration)) {
      this.showErrorMessage = true;
      this.errorMessage = 'Duration must be a positive number';
      return;
    }

    const releasedDate = new Date(this.form.get('releasedDate')?.value);
    const endDate = new Date(this.form.get('endDate')?.value);
    if (endDate < releasedDate) {
      this.showErrorMessage = true;
      this.errorMessage = 'End date cannot be before release date';
      return;
    }

    const genres = this.form.get('genres') as FormArray;
    if (genres.length === 0) {
      this.showErrorMessage = true;
      this.errorMessage = 'Please select at least one genre';
      return;
    }

    const schedules = this.form.get('schedules') as FormArray;
    if (schedules.length === 0) {
      this.showErrorMessage = true;
      this.errorMessage = 'Please select at least one schedule';
      return;
    }

    const formData = new FormData();
    const formValue = this.form.getRawValue();

    formData.append('name', formValue.name);
    formData.append('duration', formValue.duration.toString());
    formData.append('origin', formValue.origin);
    formData.append('description', formValue.description);
    formData.append('version', formValue.version);
    formData.append('director', formValue.director);
    formData.append('actors', formValue.actor);
    formData.append('status', formValue.status);
    formData.append('releasedDate', formValue.releasedDate);
    formData.append('endDate', formValue.endDate);
    formData.append('cinemaRoomId', formValue.cinemaroomId);

    formValue.schedules.forEach((scheduleId: string, index: number) => {
      formData.append(`selectedShowTimeSlots[${index}]`, scheduleId);
    });

    formValue.genres.forEach((genre: string, index: number) => {
      formData.append(`selectedGenres[${index}]`, genre);
    });

    if (this.selectedFile) {
      formData.append('posterImage', this.selectedFile);
    }

    if (this.selectedItem) {
      formData.append('id', this.selectedItem.id);
      this.movieAdminService
        .updateWithFile(this.selectedItem.id, formData)
        .subscribe({
          next: (res) => {
            if (res) {
              console.log('Movie updated successfully');
              this.dataChanged.emit();
              this.onClose();
            } else {
              console.log('Update failed');
              this.showErrorMessage = true;
              this.errorMessage = 'Failed to update movie';
            }
          },
          error: (error) => {
            this.showErrorMessage = true;
            this.errorMessage = error.error?.message || 'An error occurred while updating the movie';
            console.error('Update error:', error);
          },
        });
    } else {
      this.movieAdminService.createWithFile(formData).subscribe({
        next: (res) => {
          if (res) {
            console.log('Movie created successfully');
            this.dataChanged.emit();
            this.onClose();
          } else {
            console.log('Create failed');
            this.showErrorMessage = true;
            this.errorMessage = 'Failed to create movie';
          }
        },
        error: (error) => {
          this.showErrorMessage = true;
          this.errorMessage = error.error?.message || 'An error occurred while creating the movie';
          console.error('Create error:', error);
        },
      });
    }
  }
}