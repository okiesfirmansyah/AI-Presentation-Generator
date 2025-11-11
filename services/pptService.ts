import pptxgen from "pptxgenjs";
import { PresentationData } from '../types';

/**
 * Creates a PowerPoint presentation from the given data and triggers a download.
 * @param data The presentation data including title and slides.
 * @param coverImageBase64 Optional base64 string for the cover slide background.
 * @param contentImageBase64 Optional base64 string for the content slides background.
 */
export const createPresentation = (
  data: PresentationData,
  coverImageBase64: string | null,
  contentImageBase64: string | null
) => {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  // --- Title Slide ---
  const titleSlide = pptx.addSlide();
  if (coverImageBase64) {
    titleSlide.background = { data: coverImageBase64 };
  } else {
    titleSlide.background = { color: "003366" }; // A dark blue background
  }
  
  titleSlide.addText(data.presentationTitle, {
    x: 0.5,
    y: 2.5, // Adjusted y-position for better centering
    w: '90%',
    h: 2,
    align: 'center',
    fontSize: 48,
    bold: true,
    color: "FFFFFF",
  });

  // --- Content Slides ---
  data.slides.forEach(slideContent => {
    const slide = pptx.addSlide();
    if (contentImageBase64) {
      slide.background = { data: contentImageBase64 };
    } else {
      slide.background = { color: "F4F4F4" };
    }
    
    // Slide Title
    slide.addText(slideContent.title, {
      x: 0.5,
      y: 0.5,
      w: '90%',
      h: 0.75,
      fontSize: 36,
      bold: true,
      color: "003366"
    });
    
    // Slide Points
    slide.addText(slideContent.points.join('\n'), {
      x: 0.5,
      y: 1.5,
      w: '90%',
      h: '75%',
      bullet: true,
      fontSize: 24,
      color: "333333"
    });
  });

  // Sanitize filename to prevent issues
  const safeFileName = data.presentationTitle.replace(/[^a-z0-9 -]/gi, '_').toLowerCase();
  
  // Generate and download the presentation
  pptx.writeFile({ fileName: `${safeFileName}.pptx` });
};