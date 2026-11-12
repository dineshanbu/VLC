export interface LocalizedSectionHeading {
  en: string;
  ar: string;
}

export interface SectionHeadingDefinition extends LocalizedSectionHeading {
  key: string;
  page: string;
  pageLabel: string;
  section: string;
  valueType?: 'label' | 'heading' | 'description';
}
