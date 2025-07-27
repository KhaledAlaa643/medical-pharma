// shared-modal.component.ts
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ToggleModal } from '@services/toggleModal.service';
import * as bootstrap from 'bootstrap';

@Component({
    selector: 'app-notes-modal',
    templateUrl: './notes-modal.component.html',
    standalone:false
})
export class NotesModalComponent implements OnInit {

    imageUrls = [
        // 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/UploadingImagesHandout.pdf/page1-463px-UploadingImagesHandout.pdf.jpg',
        // 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/UploadingImagesHandout.pdf/page1-463px-UploadingImagesHandout.pdf.jpg',
        // 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/UploadingImagesHandout.pdf/page1-463px-UploadingImagesHandout.pdf.jpg'

    ];
    fileUrls = [
        // 'https://upload.wikimedia.org/wikipedia/commons/c/c3/20131102_Lofzang_op_de_Wikipediaan_door_Peter_Olsthoorn.pdf',
        // 'https://upload.wikimedia.org/wikipedia/commons/c/c3/20131102_Lofzang_op_de_Wikipediaan_door_Peter_Olsthoorn.pdf',
        // 'https://upload.wikimedia.org/wikipedia/commons/c/c3/20131102_Lofzang_op_de_Wikipediaan_door_Peter_Olsthoorn.pdf',
        // 'https://upload.wikimedia.org/wikipedia/commons/c/c3/20131102_Lofzang_op_de_Wikipediaan_door_Peter_Olsthoorn.pdf'
    ]
    constructor() { }

    @Input() notesModalData: any;
    @Output() editNoteEvent = new EventEmitter<string>();
    @Input() editable: any;
    note!:string
    @ViewChild('notesModal') private notesModalElementRef!: ElementRef;
    private modalInstance: bootstrap.Modal | null = null;

    ngOnInit(): void {
    }

    ngOnChanges(): void {
    }

    // Initialize or show the modal
    openModal(): void {
        this.note=this.notesModalData
        if (!this.modalInstance) {
            this.modalInstance = new bootstrap.Modal(this.notesModalElementRef.nativeElement);
        }
        this.modalInstance.show();
    }

    emitNewNote(){
       this.editNoteEvent.emit(this.note)
       this.modalInstance?.hide();
    }

    // Hide the modal
    hideModal(): void {
        this.modalInstance?.hide();
    }
}