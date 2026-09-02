import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface NewsItem {
  date: string;
  title: string;
  link: string;
  image: string;
}

@Component({
  selector: 'app-latest-news',
  imports: [RouterLink],
  templateUrl: './latest-news.html',
  styleUrl: './latest-news.css'
})
export class LatestNewsComponent {
  readonly news: NewsItem[] = [
    {
      date: 'October 30, 2025',
      title: 'VIC Signs Strategic MoU with CSL Seqirus and Saudi MoH to Localise Cell-Based Influenza Vaccine Manufacturing',
      link: 'https://vaccine.com.sa/vic-signs-strategic-mou-with-csl-seqirus-and-saudi-moh-to-localise-cell-based-influenza-vaccine-manufacturing/',
      image: 'news1.jpeg'
    },
    {
      date: 'January 19, 2025',
      title: 'Construction of Saudi Arabia’s first human vaccine factory begins',
      link: 'https://vaccine.com.sa/construction-of-saudi-arabias-first-human-vaccine-factory/',
      image: 'news2.jpg'
    },
    {
      date: 'October 26, 2024',
      title: 'Exciting Collaboration for Innovation in Vaccine Research and Development!',
      link: 'https://vaccine.com.sa/exciting-collaboration-for-innovation-in-vaccine-research/',
      image: 'news3.jpg'
    },
    {
      date: 'October 9, 2024',
      title: 'Vaccine Industrial Company Unveils New Company Introduction Video',
      link: 'https://vaccine.com.sa/unveils-new-company-introduction-video/',
      image: 'news4.jpg'
    }
  ];
}
