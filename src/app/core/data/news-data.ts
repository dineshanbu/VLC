export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  categories: string[];
  date: string;
  formattedDate: string;
  readTime: string;
  image: string;
  badge: string;
  summary: string;
  contentHtml: string;
  officialLink: string;
}

export interface PressRelease {
  id: string;
  day: string;
  month: string;
  year: string;
  title: string;
  format: string;
  size: string;
  category: string;
  categories: string[];
  downloadUrl: string;
  summary: string;
  paragraphs: string[];
}

export interface MediaAsset {
  title: string;
  description: string;
  category: string;
  format: string;
  size: string;
  fileName: string;
  downloadUrl: string;
}

export const NEWS_CATEGORIES: string[] = [
  'All',
  'Company Updates',
  'Partnerships',
  'MOU',
  'Research & Innovation',
  'Manufacturing',
  'Events',
  'Awards & Recognition'
];

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    "id": "vic-signs-strategic-mou-with-csl-seqirus-and-saudi-moh-to-localise-cell-based-influenza-vaccine-manufacturing",
    "slug": "vic-signs-strategic-mou-with-csl-seqirus-and-saudi-moh-to-localise-cell-based-influenza-vaccine-manufacturing",
    "title": "VIC Signs Strategic MoU with CSL Seqirus and Saudi MoH to Localise Cell-Based Influenza Vaccine Manufacturing",
    "category": "MOU",
    "categories": [
      "MOU",
      "Partnerships",
      "Manufacturing"
    ],
    "date": "Oct 30, 2025",
    "formattedDate": "October 30, 2025",
    "readTime": "3 min read",
    "image": "news1.jpeg",
    "badge": "MOU AGREEMENT",
    "summary": "Thursday 30 October, Riyadh – CSL Seqirus and Vaccine Industrial Company, have signed a Memorandum of Understanding with the Ministry of Health of Saudi Arabia to enhance the biotechnology sector by accessing advanced cell-based seasonal and pandemic influenza vaccines and localizing manufacturing in Saudi Arabia. Under a finalised agreement, CSL Seqirus, a leading global influenza vaccine&#8230;",
    "contentHtml": "<p><strong>Thursday 30 October, Riyadh – </strong>CSL Seqirus and Vaccine Industrial Company, have signed a Memorandum of Understanding with the Ministry of Health of Saudi Arabia to enhance the biotechnology sector by accessing advanced cell-based seasonal and pandemic influenza vaccines and localizing manufacturing in Saudi Arabia.</p>\n<p>Under a finalised agreement, CSL Seqirus, a leading global influenza vaccine manufacturer, would provide its innovative cell-based seasonal and pandemic influenza vaccines and work with Vaccine Industrial Company (VIC), a prominent Saudi vaccine company, to localize manufacturing at VIC’s new Sudair City facility.</p>\n<p>The finalised agreement would also establish pre-pandemic vaccine stockpiles for high-risk populations and an Advance Purchase Agreement to secure pandemic vaccines for the broader population, helping elevate Saudi Arabia’s preparedness in case of an influenza pandemic.</p>\n<p>Onshore manufacturing would enable scalable volumes, reduce reliance on global supply chains and provide flexibility as Saudi Arabia prioritises public health during mass gatherings such as Hajj, and hosts major events including World EXPO, FIFA World Cup 2034 and Olympic Esports Games.</p>\n<p>Cell-based influenza vaccines are designed to be an exact match to WHO-selected influenza strains and help improve vaccine effectiveness by eliminating changes that can occur in the traditional influenza vaccine manufacturing process.<sup>1-4</sup></p>\n<p>Cell-based influenza vaccine manufacturing is well suited to enabling pandemic preparedness as it reduces reliance on large volumes of critical materials and is a modern, efficient and highly scalable alternative to traditional manufacturing methods.<sup>5-7</sup></p>\n<p>The three parties will work towards closing the agreement, with an ambition to establish pandemic preparedness in 2026 and supply cell-based flu vaccines for the 2026/27 Flu Season.</p>\n<p>Dr Lorna Meldrum, CSL Seqirus, VP Commercial Operations, International & Pandemic Response said the company is delighted to sign this important public health partnership.</p>\n<p>Dr Meldrum said: “Seasonal influenza has a significant impact on families, the community and the health system in Saudi Arabia. Through this collaboration, we will leverage the best of our differentiated vaccine portfolio with the strength of Vaccine Industrial Company’s local manufacturing expertise and networks to establish the Kingdom as a regional leader in preventing seasonal influenza.”</p>\n<p>“CSL Seqirus is an influenza pandemic preparedness and response partner to over 30 governments around the world. This partnership will elevate Saudi Arabia’s influenza pandemic preparedness and response strategies in influenza – which has caused four pandemics over the last century</p>\n<p>Dr. Khaled Al-Mosa, Founder and Chairman of Vaccine Industrial Company, said the company is pleased to be contributing to the health and economy of the Kingdom.</p>\n<p>Dr Al-Mosa said: “Our vaccine manufacturing facility will begin to come online from 2028, when it will be the first of its kind in the Kingdom and the largest in the Middle East. We are delighted by the prospect of localizing advanced cell-based influenza vaccine manufacturing there for Saudi Arabia and the MENA region.</p>\n<p>“Through this collaboration with the Ministry of Health and CSL Seqirus, together we will have the opportunity to enhance the region’s health, help save lives and reduce the impact of flu.”</p>\n<h2 class=\"editorial-heading\">About Influenza in Saudi Arabia</h2>\n<p>Influenza is one of the fastest changing vaccine-preventable diseases and causes a significant impact on people and the health system in the Kingdom. It can cause mild to severe illness, and at times can lead to death.</p>\n<p>Influenza is spread globally by international travel and can be transmitted by close contact. Large-scale population movements, such as the Hajj, can lead to secondary peaks in flu cases.</p>\n<p>In Saudi Arabia, influenza can cause up to 6.3 million mild to moderate cases, 17,600 hospitalisations, and 4,440 deaths annually.<sup>8</sup> In 2024, 96 percent of patients admitted to intensive care with influenza in Saudi Arabia had not been vaccinated.<sup>9</sup></p>\n<p>An influenza epidemic in Saudi Arabia could cost society up to $1.33B USD in healthcare and productivity costs, while circulation during the hajj period could cost society up to $292M USD.<sup>10</sup></p>\n<p><img loading=\"lazy\" decoding=\"async\" class=\"alignnone size-medium wp-image-5653\" src=\"https://vaccine.com.sa/wp-content/uploads/2025/10/VIC-CSL2-640x427.jpeg\" alt=\"\" width=\"640\" height=\"427\" srcset=\"https://vaccine.com.sa/wp-content/uploads/2025/10/VIC-CSL2-640x427.jpeg 640w, https://vaccine.com.sa/wp-content/uploads/2025/10/VIC-CSL2-1280x853.jpeg 1280w, https://vaccine.com.sa/wp-content/uploads/2025/10/VIC-CSL2-768x512.jpeg 768w, https://vaccine.com.sa/wp-content/uploads/2025/10/VIC-CSL2-1536x1024.jpeg 1536w, https://vaccine.com.sa/wp-content/uploads/2025/10/VIC-CSL2-320x213.jpeg 320w, https://vaccine.com.sa/wp-content/uploads/2025/10/VIC-CSL2.jpeg 2048w\" sizes=\"auto, (max-width: 640px) 100vw, 640px\" /></p>\n<h2 class=\"editorial-heading\">References</h2>\n<ol>\n<li>Rajaram S, et al. Int J Environ Res Public Health. 2020;17(15):5423.</li>\n<li>Rajaram S, et al. Ther Adv Vaccines Immunother. 2020;8:2515135520908121.</li>\n<li>Wu NC, et al. Cell Host Microbe. 2019;25(6):836-844.</li>\n<li>Stein A, et al. Infectious Diseases and Therapy; October 2025 doi.org/10.1007/s40121-025-01230-2.</li>\n<li>CDC. Cell-based flu vaccines. <u><a href=\"https://www.cdc.gov/flu/vaccine-types/cell-based.html\"><span role=\"presentation\">cdc.gov/flu/vaccine-types/cell-based.html</span></a></u>. Accessed October 2025.</li>\n<li>Wright PF. N Engl J Med. 2008;358(24):2540-2543.</li>\n<li>Doroshenko A, et al. Expert Rev Vaccines. 2009;8(6):679-688</li>\n<li>Alshahrani AM, et al.. J Epidemiol Glob Health. 2025 Mar 20;15(1):47.</li>\n<li>Ministry of Health of Saudi Arabia. 2025. Available at: <u><a href=\"https://www.moh.gov.sa/en/Ministry/MediaCenter/News/Pages/News-2025-09-14-001.aspx\"><span role=\"presentation\">moh.gov.sa/en/Ministry/MediaCenter/News/Pages/News-2025-09-14-001</span></a></u>. Accessed October 2025.</li>\n<li>Assiri AM, et al. IJID Reg. 2023 Nov 25;10:80-86.</li>\n</ol>",
    "officialLink": "https://vaccine.com.sa/vic-signs-strategic-mou-with-csl-seqirus-and-saudi-moh-to-localise-cell-based-influenza-vaccine-manufacturing/"
  },
  {
    "id": "vaccine-facility-construction-achieves-major-milestone",
    "slug": "vaccine-facility-construction-achieves-major-milestone",
    "title": "Our Vaccine Facility Construction Achieves Major Milestone – October 2025 Update",
    "category": "Manufacturing",
    "categories": [
      "Manufacturing",
      "Company Updates"
    ],
    "date": "Oct 26, 2025",
    "formattedDate": "October 26, 2025",
    "readTime": "3 min read",
    "image": "construction_milestone_oct.jpg",
    "badge": "MANUFACTURING",
    "summary": "The construction of the Kingdom’s pioneering human vaccine manufacturing facility continues to progress ahead of schedule, marking a new chapter in Saudi Arabia’s biotechnology ambitions. A new video released today showcases the latest advancements at the factory site, reflecting rapid development and commitment to excellence. Dr. Khaled Almosa, founder of Saudi Bio, the Vaccine Industrial&#8230;",
    "contentHtml": "<p>The construction of the Kingdom’s pioneering human vaccine manufacturing facility continues to progress ahead of schedule, marking a new chapter in Saudi Arabia’s biotechnology ambitions. A new video released today showcases the latest advancements at the factory site, reflecting rapid development and commitment to excellence.</p>\n<p>Dr. Khaled Almosa, founder of Saudi Bio, the Vaccine Industrial Company and Group Chairman stated: “With gratitude to God Almighty and our visionary leadership, the facility has entered an advanced stage of construction. What started at the beginning of the year is now taking tangible shape, thanks to the dedication of our technical and engineering teams and the support we have received at every level.”</p>\n<p>Dr. Almosa expressed deep appreciation to the Kingdom’s leadership: “Their unwavering support has been crucial to turning our vision into reality. We are proud to contribute directly to the goals outlined in the National Biotechnology Strategy and Vision 2030.”</p>\n<p>Stay tuned as we continue to share updates and behind-the-scenes insights from the heart of Saudi Arabia’s evolving biotech landscape.</p>\n</div>\n\n\n\n<div class=\"news-detail-video-wrapper\"><video class=\"wp-video-shortcode\" id=\"video-5608-1\" width=\"848\" height=\"478\" autoplay preload=\"metadata\" controls=\"controls\"><source type=\"video/mp4\" src=\"https://vaccine.com.sa/wp-content/uploads/2025/10/VIC-facility-construction-Oct-2025.mp4?_=1\" /><a href=\"https://vaccine.com.sa/wp-content/uploads/2025/10/VIC-facility-construction-Oct-2025.mp4\">https://vaccine.com.sa/wp-content/uploads/2025/10/VIC-facility-construction-Oct-2025.mp4</a></video></div></div>\n\n</div>\n</div>",
    "officialLink": "https://vaccine.com.sa/vaccine-facility-construction-achieves-major-milestone/"
  },
  {
    "id": "construction-of-saudi-arabias-first-human-vaccine-factory",
    "slug": "construction-of-saudi-arabias-first-human-vaccine-factory",
    "title": "Construction of Saudi Arabia's first human vaccine factory begins",
    "category": "Manufacturing",
    "categories": [
      "Manufacturing",
      "Company Updates"
    ],
    "date": "Jan 19, 2025",
    "formattedDate": "January 19, 2025",
    "readTime": "3 min read",
    "image": "news2.jpg",
    "badge": "MANUFACTURING",
    "summary": "Dr. Khaled Al-Mousa, founder of Saudi Bio and founder of the vaccine manufacturing company, explained via a tweet on his account on the X platform that construction work on the human vaccine factory began at the beginning of this year. This factory is considered the first of its kind in the Kingdom and the largest&#8230;",
    "contentHtml": "<p>Dr. Khaled Al-Mousa, founder of Saudi Bio and founder of the vaccine manufacturing company, explained via a tweet on his account on the X platform that construction work on the human vaccine factory began at the beginning of this year. This factory is considered the first of its kind in the Kingdom and the largest .in the Middle East</p>\n\n<p>Dr. Al-Mousa said: \"Thanks be to God Almighty, today we have started construction work on the human vaccine factory project after two years of diligent work on engineering and technical preparations. We are proud of our step towards enhancing our capabilities in vaccine manufacturing, and we are striving to \".achieve the Kingdom's Vision 20/30</p>\n<p>He added: \"Over the course of 17 years, we have succeeded in localizing the manufacture of insulin and cancer treatment drugs, and today we are adding the vaccine industry to our list of achievements. This \".factory will enhance national health security and meet market needs</p>\n<p>Al-Mousa expressed his thanks and appreciation to the wise leadership, saying: \"I thank our wise leadership for the support and facilities they have provided, which enabled us to achieve these dreams. We \".are committed to actively participating in achieving the goals of the National Biotechnology Strategy</p>\n<p>Dr. Al-Mousa stressed that the factory will have a major impact on the future of the vaccine industry in the .region, wishing success to all those working in this national project.</p>\n</div>\n<p><a href=\"https://www.aleqtsad.org/%d8%a8%d8%af%d8%a1-%d8%a3%d8%b9%d9%85%d8%a7%d9%84-%d8%a8%d9%86%d8%a7%d8%a1-%d8%a3%d9%88%d9%84-%d9%85%d8%b5%d9%86%d8%b9-%d9%84%d9%84%d9%82%d8%a7%d8%ad%d8%a7%d8%aa-%d8%a7%d9%84%d8%a8%d8%b4%d8%b1%d9%8a/\">Source: aleqtsad</a></p>\n\n\n<p><img loading=\"lazy\" decoding=\"async\" class=\"alignnone size-medium wp-image-5550\" src=\"https://vaccine.com.sa/wp-content/uploads/2025/01/construction-9-640x360.jpg\" alt=\"\" width=\"640\" height=\"360\" srcset=\"https://vaccine.com.sa/wp-content/uploads/2025/01/construction-9-640x360.jpg 640w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-9-1280x720.jpg 1280w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-9-768x432.jpg 768w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-9-1536x864.jpg 1536w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-9-320x180.jpg 320w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-9.jpg 1599w\" sizes=\"auto, (max-width: 640px) 100vw, 640px\" /> <img loading=\"lazy\" decoding=\"async\" class=\"alignnone size-medium wp-image-5551\" src=\"https://vaccine.com.sa/wp-content/uploads/2025/01/construction-8-640x360.jpg\" alt=\"\" width=\"640\" height=\"360\" srcset=\"https://vaccine.com.sa/wp-content/uploads/2025/01/construction-8-640x360.jpg 640w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-8-1280x720.jpg 1280w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-8-768x432.jpg 768w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-8-1536x864.jpg 1536w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-8-320x180.jpg 320w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-8.jpg 1599w\" sizes=\"auto, (max-width: 640px) 100vw, 640px\" /> <img loading=\"lazy\" decoding=\"async\" class=\"alignnone size-medium wp-image-5552\" src=\"https://vaccine.com.sa/wp-content/uploads/2025/01/construction-7-640x360.jpg\" alt=\"\" width=\"640\" height=\"360\" srcset=\"https://vaccine.com.sa/wp-content/uploads/2025/01/construction-7-640x360.jpg 640w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-7-1280x720.jpg 1280w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-7-768x432.jpg 768w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-7-1536x864.jpg 1536w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-7-320x180.jpg 320w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-7.jpg 1599w\" sizes=\"auto, (max-width: 640px) 100vw, 640px\" /> <img loading=\"lazy\" decoding=\"async\" class=\"alignnone size-medium wp-image-5553\" src=\"https://vaccine.com.sa/wp-content/uploads/2025/01/construction-6-640x1138.jpg\" alt=\"\" width=\"640\" height=\"1138\" srcset=\"https://vaccine.com.sa/wp-content/uploads/2025/01/construction-6-640x1138.jpg 640w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-6-1280x2276.jpg 1280w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-6-768x1365.jpg 768w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-6-864x1536.jpg 864w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-6-1152x2048.jpg 1152w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-6-320x569.jpg 320w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-6-scaled.jpg 1440w\" sizes=\"auto, (max-width: 640px) 100vw, 640px\" /> <img loading=\"lazy\" decoding=\"async\" class=\"alignnone size-medium wp-image-5554\" src=\"https://vaccine.com.sa/wp-content/uploads/2025/01/construction-5-640x1139.jpg\" alt=\"\" width=\"640\" height=\"1139\" srcset=\"https://vaccine.com.sa/wp-content/uploads/2025/01/construction-5-640x1139.jpg 640w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-5-320x570.jpg 320w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-5.jpg 719w\" sizes=\"auto, (max-width: 640px) 100vw, 640px\" /> <img loading=\"lazy\" decoding=\"async\" class=\"alignnone size-medium wp-image-5555\" src=\"https://vaccine.com.sa/wp-content/uploads/2025/01/construction-4-640x151.jpg\" alt=\"\" width=\"640\" height=\"151\" srcset=\"https://vaccine.com.sa/wp-content/uploads/2025/01/construction-4-640x151.jpg 640w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-4-768x181.jpg 768w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-4-320x75.jpg 320w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-4.jpg 1280w\" sizes=\"auto, (max-width: 640px) 100vw, 640px\" /> <img loading=\"lazy\" decoding=\"async\" class=\"alignnone size-medium wp-image-5556\" src=\"https://vaccine.com.sa/wp-content/uploads/2025/01/WhatsApp-Image-2025-04-07-at-2.53.23-PM-1-640x340.jpeg\" alt=\"\" width=\"640\" height=\"340\" srcset=\"https://vaccine.com.sa/wp-content/uploads/2025/01/WhatsApp-Image-2025-04-07-at-2.53.23-PM-1-640x340.jpeg 640w, https://vaccine.com.sa/wp-content/uploads/2025/01/WhatsApp-Image-2025-04-07-at-2.53.23-PM-1-768x407.jpeg 768w, https://vaccine.com.sa/wp-content/uploads/2025/01/WhatsApp-Image-2025-04-07-at-2.53.23-PM-1-320x170.jpeg 320w, https://vaccine.com.sa/wp-content/uploads/2025/01/WhatsApp-Image-2025-04-07-at-2.53.23-PM-1.jpeg 1280w\" sizes=\"auto, (max-width: 640px) 100vw, 640px\" /> <img loading=\"lazy\" decoding=\"async\" class=\"alignnone size-medium wp-image-5558\" src=\"https://vaccine.com.sa/wp-content/uploads/2025/01/construction-3-640x360.jpg\" alt=\"\" width=\"640\" height=\"360\" srcset=\"https://vaccine.com.sa/wp-content/uploads/2025/01/construction-3-640x360.jpg 640w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-3-768x432.jpg 768w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-3-320x180.jpg 320w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-3.jpg 1280w\" sizes=\"auto, (max-width: 640px) 100vw, 640px\" /> <img loading=\"lazy\" decoding=\"async\" class=\"alignnone size-medium wp-image-5559\" src=\"https://vaccine.com.sa/wp-content/uploads/2025/01/construction-2-640x360.jpg\" alt=\"\" width=\"640\" height=\"360\" srcset=\"https://vaccine.com.sa/wp-content/uploads/2025/01/construction-2-640x360.jpg 640w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-2-768x432.jpg 768w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-2-320x180.jpg 320w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-2.jpg 1280w\" sizes=\"auto, (max-width: 640px) 100vw, 640px\" /> <img loading=\"lazy\" decoding=\"async\" class=\"alignnone size-medium wp-image-5560\" src=\"https://vaccine.com.sa/wp-content/uploads/2025/01/construction-1-640x360.jpg\" alt=\"\" width=\"640\" height=\"360\" srcset=\"https://vaccine.com.sa/wp-content/uploads/2025/01/construction-1-640x360.jpg 640w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-1-768x432.jpg 768w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-1-320x180.jpg 320w, https://vaccine.com.sa/wp-content/uploads/2025/01/construction-1.jpg 1280w\" sizes=\"auto, (max-width: 640px) 100vw, 640px\" /></p>\n\n<p><img loading=\"lazy\" decoding=\"async\" class=\"alignnone size-medium wp-image-5563\" src=\"https://vaccine.com.sa/wp-content/uploads/2025/01/km1vic-640x853.jpg\" alt=\"\" width=\"640\" height=\"853\" srcset=\"https://vaccine.com.sa/wp-content/uploads/2025/01/km1vic-640x853.jpg 640w, https://vaccine.com.sa/wp-content/uploads/2025/01/km1vic-768x1024.jpg 768w, https://vaccine.com.sa/wp-content/uploads/2025/01/km1vic-1152x1536.jpg 1152w, https://vaccine.com.sa/wp-content/uploads/2025/01/km1vic-320x427.jpg 320w, https://vaccine.com.sa/wp-content/uploads/2025/01/km1vic.jpg 1200w\" sizes=\"auto, (max-width: 640px) 100vw, 640px\" /></p>\n\n</div>\n</div>",
    "officialLink": "https://vaccine.com.sa/construction-of-saudi-arabias-first-human-vaccine-factory/"
  },
  {
    "id": "exciting-collaboration-for-innovation-in-vaccine-research",
    "slug": "exciting-collaboration-for-innovation-in-vaccine-research",
    "title": "Exciting Collaboration for Innovation in Vaccine Research and Development!",
    "category": "Partnerships",
    "categories": [
      "Partnerships",
      "MOU",
      "Research & Innovation"
    ],
    "date": "Oct 26, 2024",
    "formattedDate": "October 26, 2024",
    "readTime": "3 min read",
    "image": "news3.jpg",
    "badge": "PARTNERSHIP",
    "summary": "We are thrilled to announce that Vaccine Research, Development, and Innovation Co. (Vaccine RDI) has signed a Memorandum of Understanding (MoU) with the esteemed King Abdulaziz City for Science and Technology (KACST). This landmark partnership, sealed on October 22, 2024, marks a new chapter in advancing scientific research, technological innovation, and pharmaceutical development&#8230;.",
    "contentHtml": "<p><img loading=\"lazy\" decoding=\"async\" class=\"alignleft wp-image-3523 size-full\" style=\"width: 160px !important;\" src=\"https://vaccine.com.sa/wp-content/uploads/2024/02/vaccine-logo1-e1708599097658.png\" alt=\"\" width=\"150\" height=\"100\" /></p>\n\n<p><img loading=\"lazy\" decoding=\"async\" class=\"size-full wp-image-3523 alignright\" style=\"width: 160px !important;\" src=\"https://vaccine.com.sa/wp-content/uploads/2024/02/Vaccine-Website-design-06.png\" alt=\"\" width=\"200\" height=\"100\" /></p>\n\n\n\n<p>We are thrilled to announce that Vaccine Research, Development, and Innovation Co. (Vaccine RDI) has signed a Memorandum of Understanding (MoU) with the esteemed King Abdulaziz City for Science and Technology (KACST). This landmark partnership, sealed on October 22, 2024, marks a new chapter in advancing scientific research, technological innovation, and pharmaceutical development.</p>\n<h3 class=\"editorial-subheading\">Key Highlights of the Collaboration</h3><p>\n• Establishing a national research laboratory focused on vaccine and biopharmaceutical development.<br />\n• Leveraging the expertise of KACST's renowned researchers to support cutting-edge research.<br />\n• Promoting technology transfer and localizing pharmaceutical manufacturing to enhance Saudi Arabia's pharmaceutical security.<br />\n• Creating training opportunities for scientists and supporting pharmaceutical entrepreneurs.<br />\n• Joint scientific projects that aim to boost innovation and contribute to global health solutions.</p>\n<p>This agreement is a testament to our shared commitment to advancing healthcare solutions that contribute to the Kingdom’s strategic goals for sustainable development. Together, we are ready to make a lasting impact on global health and pharmaceutical innovation.</p>\n<p>Stay tuned for updates on the exciting progress of this collaboration!</p>\n</div>\n</div>",
    "officialLink": "https://vaccine.com.sa/exciting-collaboration-for-innovation-in-vaccine-research/"
  },
  {
    "id": "unveils-new-company-introduction-video",
    "slug": "unveils-new-company-introduction-video",
    "title": "Vaccine Industrial Company Unveils New Company Introduction Video",
    "category": "Company Updates",
    "categories": [
      "Company Updates"
    ],
    "date": "Oct 9, 2024",
    "formattedDate": "October 9, 2024",
    "readTime": "3 min read",
    "image": "news4.jpg",
    "badge": "COMPANY UPDATE",
    "summary": "We are excited to announce the release of our new company introduction video, now available on our media page. This video provides an insightful look into our mission, values, and our role as a leading manufacturer of vaccines in the Kingdom of Saudi Arabia. Watch the video to learn more about our journey, our commitment&#8230;",
    "contentHtml": "<p><img decoding=\"async\" class=\"size-full wp-image-3523 alignnone\" style=\"width: 160px !important;\" src=\"https://vaccine.com.sa/wp-content/uploads/2024/02/vaccine-logo.png\" alt=\"\" width=\"200\" srcset=\"https://vaccine.com.sa/wp-content/uploads/2024/02/vaccine-logo.png 408w, https://vaccine.com.sa/wp-content/uploads/2024/02/vaccine-logo-320x126.png 320w\" sizes=\"(max-width: 408px) 100vw, 408px\" /></p>\n\n<p>We are excited to announce the release of our new company introduction video, now available on our media page. This video provides an insightful look into our mission, values, and our role as a leading manufacturer of vaccines in the Kingdom of Saudi Arabia. Watch the video to learn more about our journey, our commitment to public health, and how we are contributing to immunization efforts across the GCC region.</p>\n</div>\n\n<div><video poster=\"https://vaccine.com.sa/wp-content/uploads/2024/02/f12.jpg\" autoplay=\"autoplay\" loop=\"loop\" muted=\"\" controls=\"controls\" width=\"100%\" height=\"300\"><source src=\"https://vaccine.com.sa/wp-content/uploads/2024/10/VIC-Introduction.mp4\" type=\"video/mp4\" /></video></div>",
    "officialLink": "https://vaccine.com.sa/unveils-new-company-introduction-video/"
  },
  {
    "id": "irish-embassy-hosts-landmark-project-management-agreement-signing",
    "slug": "irish-embassy-hosts-landmark-project-management-agreement-signing",
    "title": "Irish Embassy Hosts Landmark Project Management Agreement Signing",
    "category": "Partnerships",
    "categories": [
      "Partnerships",
      "Events",
      "Manufacturing"
    ],
    "date": "Aug 6, 2024",
    "formattedDate": "August 6, 2024",
    "readTime": "3 min read",
    "image": "irish_embassy_vic.jpg",
    "badge": "PARTNERSHIP",
    "summary": "Under the esteemed patronage of His Excellency the Irish Ambassador and representatives of the Irish government, a significant milestone in the biotechnology and vaccine manufacturing sector was achieved today at the Irish Embassy. A project management agreement was officially signed between VACCINE INDUSTRIAL COMPANY (VIC) the largest vaccine manufacturer in the Middle East, Modon-Sudair, and&#8230;",
    "contentHtml": "<p><img decoding=\"async\" class=\"size-full wp-image-3523 alignnone\" style=\"width: 160px !important;\" src=\"https://vaccine.com.sa/wp-content/uploads/2024/02/vaccine-logo.png\" alt=\"\" width=\"200\" srcset=\"https://vaccine.com.sa/wp-content/uploads/2024/02/vaccine-logo.png 408w, https://vaccine.com.sa/wp-content/uploads/2024/02/vaccine-logo-320x126.png 320w\" sizes=\"(max-width: 408px) 100vw, 408px\" /></p>\n\n<p><strong>Under the esteemed patronage of His Excellency the Irish Ambassador and representatives of the Irish government, a significant milestone in the biotechnology and vaccine manufacturing sector was achieved today at the Irish Embassy.</strong></p>\n<p>A project management agreement was officially signed between VACCINE INDUSTRIAL COMPANY (VIC) the largest vaccine manufacturer in the Middle East, Modon-Sudair, and ZYME GLOBAL BIOTECH. This strategic partnership aims to enhance the production capabilities and global reach of both entities, marking a new era of collaboration in the field of vaccine manufacturing.</p>\n<p>The agreement, celebrated with a formal ceremony, underscores the commitment of both companies to advancing healthcare solutions and ensuring vaccine availability on a global scale.</p>\n<p>Congratulations to the homeland! As we embark on this journey, we feel an immense sense of responsibility to drive innovation and deliver critical health solutions to communities worldwide.</p>\n</div>\n</div>",
    "officialLink": "https://vaccine.com.sa/irish-embassy-hosts-landmark-project-management-agreement-signing/"
  },
  {
    "id": "saudi-arabia-injects-133m-into-vaccine-factory",
    "slug": "saudi-arabia-injects-133m-into-vaccine-factory",
    "title": "Saudi Arabia injects $133m into vaccine factory",
    "category": "Manufacturing",
    "categories": [
      "Manufacturing",
      "Company Updates"
    ],
    "date": "Mar 20, 2024",
    "formattedDate": "March 20, 2024",
    "readTime": "3 min read",
    "image": "saudi_133m_factory.webp",
    "badge": "MANUFACTURING",
    "summary": "SAR500m facility in Sudair City To produce vaccines and medicines Pharma worth $19.8bn by 2032 Saudi Arabia is planning to invest SAR500 million ($133 million) in a factory to boost local vaccine and medicine manufacturing capacity as the kingdom seeks to become a regional centre for biotechnology. Saudi Authority for Industrial Cities and Technology Zones,&#8230;",
    "contentHtml": "<p><img decoding=\"async\" class=\"size-full wp-image-3523 alignnone\" style=\"width: 160px !important;\" src=\"https://vaccine.com.sa/wp-content/uploads/2024/02/vaccine-logo.png\" alt=\"\" width=\"200\" srcset=\"https://vaccine.com.sa/wp-content/uploads/2024/02/vaccine-logo.png 408w, https://vaccine.com.sa/wp-content/uploads/2024/02/vaccine-logo-320x126.png 320w\" sizes=\"(max-width: 408px) 100vw, 408px\" /><img loading=\"lazy\" decoding=\"async\" width=\"510\" height=\"580\" class=\"size-full wp-image-5055 alignnone\" style=\"width: 90px !important; margin-left: 50px;\" src=\"https://vaccine.com.sa/wp-content/uploads/2024/03/ModonLogo.jpg\" alt=\"\" srcset=\"https://vaccine.com.sa/wp-content/uploads/2024/03/ModonLogo.jpg 510w, https://vaccine.com.sa/wp-content/uploads/2024/03/ModonLogo-320x364.jpg 320w\" sizes=\"auto, (max-width: 510px) 100vw, 510px\" /></p>\n<ul class=\"key-points\">\n<li style=\"text-align: left;\"><strong>SAR500m facility in Sudair City</strong></li>\n<li style=\"text-align: left;\"><strong>To produce vaccines and medicines</strong></li>\n<li style=\"text-align: left;\"><strong>Pharma worth $19.8bn by 2032</strong></li>\n</ul>\n<p>Saudi Arabia is planning to invest SAR500 million ($133 million) in a factory to boost local vaccine and medicine manufacturing capacity as the kingdom seeks to become a regional centre for biotechnology.</p>\n<p>Saudi Authority for Industrial Cities and Technology Zones, also known as Modon, has signed an investment agreement with the Vaccine Industrial Company to set up a joint venture factory in Sudair City.</p>\n<p>Modon said the project aims to strengthen the pharmaceutical security system and localise the manufacturing of vaccines in the kingdom.</p>\n<p>The 42,000 square metre plant will create around 150 new jobs and aims to boost exports of vaccines such as those for the seasonal flu virus, Covid-19, chickenpox, pneumococcal and meningitis.</p>\n<p><a href=\"https://www.agbi.com/health/2023/09/saudi-arabia-injects-133m-into-vaccine-factory/\" target=\"_blank\" rel=\"noopener\">Read more</a></p>",
    "officialLink": "https://vaccine.com.sa/saudi-arabia-injects-133m-into-vaccine-factory/"
  },
  {
    "id": "baylor-college-of-medicine-and-vic-rdi-have-signed-academic-and-rd-agreement-for-vaccine-development",
    "slug": "baylor-college-of-medicine-and-vic-rdi-have-signed-academic-and-rd-agreement-for-vaccine-development",
    "title": "Baylor College of Medicine and VCRDI have signed Academic and R&D agreement for vaccine development.",
    "category": "Research & Innovation",
    "categories": [
      "Research & Innovation",
      "Partnerships",
      "MOU"
    ],
    "date": "Mar 17, 2024",
    "formattedDate": "March 17, 2024",
    "readTime": "3 min read",
    "image": "baylor_vic_agreement.jpg",
    "badge": "RESEARCH",
    "summary": "VCRDI and Baylor College of Medicine (BCM) have signed Academic and R&D agreement for vaccine development. VCRDI and BCM have singed a training agreement to train VCRDI scientists in vaccine development, including scale-up process development, quality control testing, formulation technology, and regulatory documentation. The Training Program will be conducted at BCM’s facilities (Center for Vaccine&#8230;",
    "contentHtml": "<p><img loading=\"lazy\" decoding=\"async\" class=\"alignnone size-full wp-image-3528\" style=\"width: 120px !important;\" src=\"https://vaccine.com.sa/wp-content/uploads/2024/02/vaccine-logo1-e1708599097658.png\" alt=\"\" width=\"388\" height=\"161\" srcset=\"https://vaccine.com.sa/wp-content/uploads/2024/02/vaccine-logo1-e1708599097658.png 388w, https://vaccine.com.sa/wp-content/uploads/2024/02/vaccine-logo1-e1708599097658-320x133.png 320w\" sizes=\"auto, (max-width: 388px) 100vw, 388px\" /><img loading=\"lazy\" decoding=\"async\" class=\"alignnone size-full wp-image-4298\" style=\"width: 110px !important; margin-left: 10px;\" src=\"https://vaccine.com.sa/wp-content/uploads/2024/02/Vaccine-Website-design-06.png\" alt=\"\" width=\"562\" height=\"183\" srcset=\"https://vaccine.com.sa/wp-content/uploads/2024/02/Vaccine-Website-design-06.png 562w, https://vaccine.com.sa/wp-content/uploads/2024/02/Vaccine-Website-design-06-320x104.png 320w\" sizes=\"auto, (max-width: 562px) 100vw, 562px\" /><img loading=\"lazy\" decoding=\"async\" class=\"alignnone size-full wp-image-4951\" style=\"width: 70px !important; margin-left: 10px;\" src=\"https://vaccine.com.sa/wp-content/uploads/2024/03/Baylor_College_of_Medicine_Logo.jpg\" alt=\"\" width=\"600\" height=\"600\" srcset=\"https://vaccine.com.sa/wp-content/uploads/2024/03/Baylor_College_of_Medicine_Logo.jpg 600w, https://vaccine.com.sa/wp-content/uploads/2024/03/Baylor_College_of_Medicine_Logo-160x160.jpg 160w, https://vaccine.com.sa/wp-content/uploads/2024/03/Baylor_College_of_Medicine_Logo-320x320.jpg 320w\" sizes=\"auto, (max-width: 600px) 100vw, 600px\" /></p>\n<p>VCRDI and Baylor College of Medicine (BCM) have signed Academic and R&D agreement for vaccine development.</p>\n<p>VCRDI and BCM have singed a training agreement to train VCRDI scientists in vaccine development, including scale-up process development, quality control testing, formulation technology, and regulatory documentation. The Training Program will be conducted at BCM’s facilities (Center for Vaccine Development).</p>",
    "officialLink": "https://vaccine.com.sa/baylor-college-of-medicine-and-vic-rdi-have-signed-academic-and-rd-agreement-for-vaccine-development/"
  },
  {
    "id": "modon-and-vic-have-signed-land-allocation-contacts-to-establish-the-vaccine-facility-in-sudair-industrial-city",
    "slug": "modon-and-vic-have-signed-land-allocation-contacts-to-establish-the-vaccine-facility-in-sudair-industrial-city",
    "title": "Modon and VIC have signed land allocation contract to establish the vaccine facility in Sudair Industrial City",
    "category": "Manufacturing",
    "categories": [
      "Manufacturing",
      "Company Updates"
    ],
    "date": "Mar 17, 2024",
    "formattedDate": "March 17, 2024",
    "readTime": "3 min read",
    "image": "modon_vic_land.jpg",
    "badge": "MANUFACTURING",
    "summary": "Vaccine industrials company and Saudi authority for industrial cities and technology zone (modon) have signed land allocation agreement with an area of 42 thousand and square meters to establish vaccines manufacturing facility in sudair industrial city, Saudi Arabia.",
    "contentHtml": "<p><img decoding=\"async\" class=\"size-full wp-image-3523 alignnone\" style=\"width: 160px !important;\" src=\"https://vaccine.com.sa/wp-content/uploads/2024/02/vaccine-logo.png\" alt=\"\" width=\"200\" srcset=\"https://vaccine.com.sa/wp-content/uploads/2024/02/vaccine-logo.png 408w, https://vaccine.com.sa/wp-content/uploads/2024/02/vaccine-logo-320x126.png 320w\" sizes=\"(max-width: 408px) 100vw, 408px\" /><img loading=\"lazy\" decoding=\"async\" width=\"510\" height=\"580\" class=\"size-full wp-image-5055 alignnone\" style=\"width: 90px !important; margin-left: 50px;\" src=\"https://vaccine.com.sa/wp-content/uploads/2024/03/ModonLogo.jpg\" alt=\"\" srcset=\"https://vaccine.com.sa/wp-content/uploads/2024/03/ModonLogo.jpg 510w, https://vaccine.com.sa/wp-content/uploads/2024/03/ModonLogo-320x364.jpg 320w\" sizes=\"auto, (max-width: 510px) 100vw, 510px\" /></p>\n<p>Vaccine industrials company and Saudi authority for industrial cities and technology zone (modon) have signed land allocation agreement with an area of 42 thousand and square meters to establish vaccines manufacturing facility in sudair industrial city, Saudi Arabia.</p>",
    "officialLink": "https://vaccine.com.sa/modon-and-vic-have-signed-land-allocation-contacts-to-establish-the-vaccine-facility-in-sudair-industrial-city/"
  },
  {
    "id": "saudi-arabia-announces-133m-vaccine-manufacturing-facility",
    "slug": "saudi-arabia-announces-133m-vaccine-manufacturing-facility",
    "title": "Saudi Arabia announces $133m vaccine manufacturing facility",
    "category": "Company Updates",
    "categories": [
      "Company Updates",
      "Manufacturing"
    ],
    "date": "Feb 17, 2024",
    "formattedDate": "February 17, 2024",
    "readTime": "3 min read",
    "image": "saudi_flag_announcement.jpg",
    "badge": "COMPANY UPDATE",
    "summary": "Saudi Authority for Industrial Cities and Technology Zones (MODON) has signed a SR500m ($133m) investment agreement with the Vaccine Industrial Company (Vaccine) to set up a joint venture factory in Sudair City to strengthen the pharmaceutical security system and localise the manufacturing of vaccines and vital medicines in the Kingdom. This agreement comes in line&#8230;",
    "contentHtml": "<p><img decoding=\"async\" class=\"size-full wp-image-3523 alignnone\" style=\"width: 160px !important;\" src=\"https://vaccine.com.sa/wp-content/uploads/2024/02/vaccine-logo.png\" alt=\"\" width=\"200\" srcset=\"https://vaccine.com.sa/wp-content/uploads/2024/02/vaccine-logo.png 408w, https://vaccine.com.sa/wp-content/uploads/2024/02/vaccine-logo-320x126.png 320w\" sizes=\"(max-width: 408px) 100vw, 408px\" /><img loading=\"lazy\" decoding=\"async\" width=\"510\" height=\"580\" class=\"size-full wp-image-5055 alignnone\" style=\"width: 90px !important; margin-left: 50px;\" src=\"https://vaccine.com.sa/wp-content/uploads/2024/03/ModonLogo.jpg\" alt=\"\" srcset=\"https://vaccine.com.sa/wp-content/uploads/2024/03/ModonLogo.jpg 510w, https://vaccine.com.sa/wp-content/uploads/2024/03/ModonLogo-320x364.jpg 320w\" sizes=\"auto, (max-width: 510px) 100vw, 510px\" /></p>\n<p>Saudi Authority for Industrial Cities and Technology Zones (<a href=\"https://modon.gov.sa/en/Pages/default.aspx\" target=\"_blank\" rel=\"noreferrer noopener nofollow\" data-type=\"link\" data-id=\"https://modon.gov.sa/en/Pages/default.aspx\">MODON</a>) has signed a SR500m ($133m) investment agreement with the Vaccine Industrial Company (Vaccine) to set up a joint venture factory in Sudair City to strengthen the pharmaceutical security system and localise the manufacturing of vaccines and vital medicines in the Kingdom.</p>\n\n<p>This agreement comes in line with MODON’s strategy to create an integrated industrial and investment community to attract national and foreign investor partners and to reinforce its initiatives and efforts to enhance the sustainability of the industrial sector.</p>\n<h2 class=\"editorial-heading\">Saudi Vaccine Manufacturing</h2>\n<p>It also aims to increase the pharmaceutical sector’s share of GDP and raising the percentage of its exports, in line with the objectives of the national industry strategy to make the Kingdom an attractive hub for quality investments.</p>\n<p>The 42,000sq m plant will create around 150 new jobs and aims to achieve 20 per cent export of seasonal flu virus, COVID-19, chickenpox, and rotavirus vaccines, in addition to pneumococcal and meningitis vaccines, given the strong demand for Saudi pharmaceutical exports in the Gulf and regional countries.</p>\n</div>\n<p><a href=\"https://www.arabianbusiness.com/industries/healthcare/saudi-arabia-announces-133m-vaccine-manufacturing-facility\" target=\"_blank\" rel=\"noopener\">Read more</a></p>\n\n<p><a href=\"https://www.adghw.com/press-media/in-the-news/in-the-news/2022/june/saudi-arabia-announces-133m-vaccine-manufacturing-facility/\">https://www.adghw.com/press-media/in-the-news/in-the-news/2022/june/saudi-arabia-announces-133m-vaccine-manufacturing-facility/</a></p>\n\n</div>",
    "officialLink": "https://vaccine.com.sa/saudi-arabia-announces-133m-vaccine-manufacturing-facility/"
  },
  {
    "id": "president-of-research-development-and-innocation-authority-rdia-meeting-with-vic-rdi-team",
    "slug": "president-of-research-development-and-innocation-authority-rdia-meeting-with-vic-rdi-team",
    "title": "President of Research, Development and Innovation Authority (RDIA) meeting with VIC-RDI team",
    "category": "Research & Innovation",
    "categories": [
      "Research & Innovation",
      "Events"
    ],
    "date": "Jan 28, 2024",
    "formattedDate": "January 28, 2024",
    "readTime": "3 min read",
    "image": "rdia_meeting_vic.jpg",
    "badge": "RESEARCH",
    "summary": "President of Research, Development and Innovation Authority (RDIA) meeting with VCRDI team to discuss the authority roles in supporting RDI system in Saudi Arabia and to discuss ways to facilitate technology transfer and vaccine development localization efforts.",
    "contentHtml": "<p><img loading=\"lazy\" decoding=\"async\" class=\"alignnone size-full wp-image-3528\" style=\"width: 150px !important;\" src=\"https://vaccine.com.sa/wp-content/uploads/2024/02/vaccine-logo1-e1708599097658.png\" alt=\"\" width=\"388\" height=\"161\" srcset=\"https://vaccine.com.sa/wp-content/uploads/2024/02/vaccine-logo1-e1708599097658.png 388w, https://vaccine.com.sa/wp-content/uploads/2024/02/vaccine-logo1-e1708599097658-320x133.png 320w\" sizes=\"auto, (max-width: 388px) 100vw, 388px\" /><img loading=\"lazy\" decoding=\"async\" class=\"alignnone size-full wp-image-5063\" style=\"width: 150px !important; margin-left: 20px;\" src=\"https://vaccine.com.sa/wp-content/uploads/2024/01/rdia.png\" alt=\"\" width=\"356\" height=\"118\" srcset=\"https://vaccine.com.sa/wp-content/uploads/2024/01/rdia.png 356w, https://vaccine.com.sa/wp-content/uploads/2024/01/rdia-320x106.png 320w\" sizes=\"auto, (max-width: 356px) 100vw, 356px\" /><br />\nPresident of Research, Development and Innovation Authority (RDIA) meeting with VCRDI team to discuss the authority roles in supporting RDI system in Saudi Arabia and to discuss ways to facilitate technology transfer and vaccine development localization efforts.</p>",
    "officialLink": "https://vaccine.com.sa/president-of-research-development-and-innocation-authority-rdia-meeting-with-vic-rdi-team/"
  }
];

export const PRESS_RELEASES: PressRelease[] = [
  {
    id: 'pr-q1-2025',
    day: '08',
    month: 'MAY',
    year: '2025',
    title: 'VIC Reports Strong Progress in Q1 2025 Operations and Strategic Initiatives',
    format: 'PDF',
    size: '420 KB',
    category: 'Company Updates',
    categories: ['Company Updates', 'Manufacturing'],
    downloadUrl: 'home_banner.png',
    summary: 'Official Q1 2025 progress report on facility development, engineering milestones, and strategic institutional alliances in Sudair Industrial City.',
    paragraphs: [
      'Vaccine Industrial Holding LLC (VIC) has released its official Q1 2025 corporate statement detailing key advancements across cleanroom pre-validation, strategic partnerships, and construction timelines in Sudair Industrial City.',
      'The report highlights robust capital allocation, operational progress exceeding targets, and expanded workforce recruitment of specialized Saudi bioprocess engineers.'
    ]
  },
  {
    id: 'pr-mou-global-manufacturer',
    day: '25',
    month: 'APR',
    year: '2025',
    title: 'VIC Signs MoU with Leading Global Vaccine Manufacturer',
    format: 'PDF',
    size: '380 KB',
    category: 'MOU',
    categories: ['MOU', 'Partnerships'],
    downloadUrl: 'news1.jpeg',
    summary: 'Formal press statement on the bilateral Memorandum of Understanding for advanced antigen technology transfer and localized formulation.',
    paragraphs: [
      'Vaccine Industrial Company announces the signing of a landmark Memorandum of Understanding (MoU) with a leading global biopharmaceutical manufacturer.',
      'The agreement encompasses mutual intellectual collaboration, licensing, and full technological localization of essential human vaccines in Saudi Arabia.'
    ]
  },
  {
    id: 'pr-chief-scientific-officer',
    day: '10',
    month: 'APR',
    year: '2025',
    title: 'VIC Appoints New Chief Scientific Officer to Drive Innovation',
    format: 'PDF',
    size: '350 KB',
    category: 'Research & Innovation',
    categories: ['Research & Innovation', 'Company Updates'],
    downloadUrl: 'baylor_vic_agreement.jpg',
    summary: 'Executive appointment announcement strengthening scientific governance and translational clinical pipelines.',
    paragraphs: [
      'Vaccine Industrial Company is pleased to announce the executive appointment of its new Chief Scientific Officer (CSO) to oversee research consortia, regulatory dossiers, and clinical trial strategy.',
      'The appointment reinforces VIC’s commitment to scientific rigor and long-term innovation in the biomanufacturing domain.'
    ]
  },
  {
    id: 'pr-geneva-exhibition',
    day: '18',
    month: 'MAR',
    year: '2025',
    title: 'VIC Participates in Global Health Exhibition in Geneva',
    format: 'PDF',
    size: '290 KB',
    category: 'Events',
    categories: ['Events'],
    downloadUrl: 'news4.jpg',
    summary: 'Press announcement detailing VIC’s keynote presentations and bilateral roundtables at the Geneva Global Health Exhibition.',
    paragraphs: [
      'A high-level executive delegation from Vaccine Industrial Company participated in the Global Health Exhibition in Geneva, meeting with international health authorities and biotechnology executives.'
    ]
  }
];

export const MEDIA_ASSETS: MediaAsset[] = [
  {
    title: 'VIC Official Brand & Logo Kit',
    description: 'Vector SVG, High-Res PNG (Light & Dark backgrounds), brand guidelines & color tokens.',
    category: 'Brand Assets',
    format: 'ZIP (SVG, PNG)',
    size: '12.4 MB',
    fileName: 'VIC_Brand_Logo_Kit_2025.zip',
    downloadUrl: 'logo_navbar.png'
  },
  {
    title: 'VIC Corporate Factsheet (2025 Edition)',
    description: 'Official factsheet detailing company milestones, leadership, facility specifications & alliances.',
    category: 'Factsheet',
    format: 'PDF',
    size: '2.8 MB',
    fileName: 'VIC_Corporate_Factsheet_2025.pdf',
    downloadUrl: 'home_banner.png'
  },
  {
    title: 'Executive Leadership Bios & Portraits',
    description: 'Official portraits and verified executive biographies of Dr. Khaled Almosa and VIC board members.',
    category: 'Executive Media',
    format: 'ZIP (PDF, JPG)',
    size: '18.6 MB',
    fileName: 'VIC_Executive_Leadership_Media_Pack.zip',
    downloadUrl: 'Dr.Khaled-Almosa.jpeg'
  },
  {
    title: 'Facility & Cleanroom High-Res Photos',
    description: 'Approved high-resolution press imagery of Sudair facility, laboratory suites, and robotic lines.',
    category: 'Press Photos',
    format: 'ZIP (JPG, 300 DPI)',
    size: '45.2 MB',
    fileName: 'VIC_Facility_Cleanroom_B-Roll_PressPack.zip',
    downloadUrl: 'about_vic_lab.png'
  }
];

export function getArticleBySlug(slug: string): NewsArticle | undefined {
  return NEWS_ARTICLES.find(a => a.slug === slug || a.id === slug);
}

export function getRelatedArticles(currentSlug: string, count: number = 3): NewsArticle[] {
  const current = getArticleBySlug(currentSlug);
  if (!current) {
    return NEWS_ARTICLES.slice(0, count);
  }
  const related = NEWS_ARTICLES.filter(a => a.slug !== currentSlug && (
    a.category === current.category ||
    a.categories.some(c => current.categories.includes(c))
  ));
  if (related.length >= count) {
    return related.slice(0, count);
  }
  const remaining = NEWS_ARTICLES.filter(a => a.slug !== currentSlug && !related.includes(a));
  return [...related, ...remaining].slice(0, count);
}
