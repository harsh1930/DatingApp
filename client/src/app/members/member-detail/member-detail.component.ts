import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions } from '@kolkov/ngx-gallery';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { Member } from 'src/app/_models/member';
import { Message } from 'src/app/_models/message';
import { User } from 'src/app/_models/user';
import { AccountService } from 'src/app/_services/account.service';
import { MesssageService } from 'src/app/_services/message.service';
import { PresenceService } from 'src/app/_services/presence.service';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit, OnDestroy {
  @ViewChild('memberTabs', {static: true}) memberTabs?: TabsetComponent;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];
  member: Member = {} as Member;
  activeTab?: TabDirective;
  messages: Message[] = [];
  user?: User;
  constructor(private accountService: AccountService, private route: ActivatedRoute,
     private messageService : MesssageService, public presenceService: PresenceService) { 
      this.accountService.currentUser$.subscribe({
        next: user => {
          if(user) this.user = user;
        } 
      })
     }

  ngOnInit(): void {
    this.route.data.subscribe({
      next: data => this.member = data['member']
    })

    this.route.queryParams.subscribe({
      next: params => {
        params['tab'] && this.selectTab(params['tab'])
      }
    })

    this.galleryOptions = [
      {
        width: '500px',
        height: '500px',
        imagePercent: 100,
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        preview: false
      }
    ]
    this.galleryImages = this.getImages();  
  } 

  ngOnDestroy(): void {
    this.messageService.stopHubConnection();
  }
  getImages(): NgxGalleryImage[]{
    const imageUrls = [];   
    for(let photo of this.member.photos){
      imageUrls.push({
        small: photo?.url,
        medium: photo?.url,
        big: photo?.url
      })
    }
    return imageUrls;
  }


 loadMessages(){
  if(this.member){
    this.messageService.getMessageThread(this.member.userName).subscribe({
      next: messages => this.messages = messages
    })
  }
}
 onTabActivated(data: TabDirective){
  this.activeTab = data;

  if(this.activeTab.heading === "Messages" && this.user){
    this.messageService.createHubConnection(this.user, this.member.userName);
  }
  else{
    this.messageService.stopHubConnection();
  }
 }

 selectTab(heading: string){
  if(this.memberTabs){
    this.memberTabs.tabs.find(x => x.heading === heading)!.active = true;
  }
 }
}
