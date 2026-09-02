import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-about-vic',
  imports: [RouterLink],
  templateUrl: './about-vic.html',
  styleUrl: './about-vic.css'
})
export class AboutVicComponent {
  readonly bgVideoUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    // Autoplay muted loop YouTube video
    this.bgVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.youtube.com/embed/0fAKs5ctxvI?autoplay=1&mute=1&loop=1&playlist=0fAKs5ctxvI&playsinline=1&controls=0&rel=0&showinfo=0&disablekb=1&modestbranding=1&enablejsapi=1'
    );
  }

  onIframeLoad(event: Event): void {
    const iframe = event.target as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*');
      iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
    }
  }
}
