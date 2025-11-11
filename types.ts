export interface SlideContent {
  title: string;
  points: string[];
}

export interface PresentationData {
  presentationTitle: string;
  slides: SlideContent[];
}
