import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import React, { useState } from "react";

interface ResumePDFProps {
  targetRef: React.RefObject<HTMLDivElement>;
}

export default function ResumePDF({ targetRef }: ResumePDFProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!targetRef.current) return;

    setIsGenerating(true);
    
    try {
      // Store original styles
      const originalOverflow = document.body.style.overflow;
      
      // Temporarily modify body to prevent scrolling issues
      document.body.style.overflow = 'hidden';
      
      // Add comprehensive print styles that target the actual element structure
      const printStyles = document.createElement('style');
      printStyles.innerHTML = `
        /* Apply to the target element directly */
        [data-pdf-capture="true"] {
          font-family: 'Times New Roman', Times, serif !important;
          background: white !important;
          box-shadow: none !important;
          border: none !important;
          margin: 0 !important;
          padding: 20px !important;
          max-width: none !important;
          width: 794px !important;
          min-height: auto !important;
          position: relative !important;
          transform: none !important;
          overflow: visible !important;
        }
        
        [data-pdf-capture="true"] * {
          font-family: 'Times New Roman', Times, serif !important;
          box-sizing: border-box !important;
        }
        
        /* Reset all padding on sections */
        [data-pdf-capture="true"] .px-6,
        [data-pdf-capture="true"] .px-10 {
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
        
        [data-pdf-capture="true"] .py-4,
        [data-pdf-capture="true"] .py-5,
        [data-pdf-capture="true"] .pt-6,
        [data-pdf-capture="true"] .pt-8,
        [data-pdf-capture="true"] .pb-4,
        [data-pdf-capture="true"] .pb-5 {
          padding-top: 8px !important;
          padding-bottom: 8px !important;
        }
        
        /* Section spacing */
        [data-pdf-capture="true"] .mb-3 {
          margin-bottom: 6px !important;
        }
        
        [data-pdf-capture="true"] .mb-4 {
          margin-bottom: 8px !important;
        }
        
        [data-pdf-capture="true"] .space-y-4 > * + * {
          margin-top: 8px !important;
        }
        
        /* Border and visual elements */
        [data-pdf-capture="true"] .border-b {
          border-bottom: 1px solid #d1d5db !important;
          margin-bottom: 6px !important;
          padding-bottom: 3px !important;
        }
        
        /* Badges and chips styling */
        [data-pdf-capture="true"] .bg-gray-100,
        [data-pdf-capture="true"] .bg-gray-50 {
          background-color: #f3f4f6 !important;
          color: #374151 !important;
          border: 1px solid #d1d5db !important;
          padding: 2px 6px !important;
          border-radius: 3px !important;
          font-size: 10px !important;
          display: inline-block !important;
        }
        
        /* Grid layouts */
        [data-pdf-capture="true"] .grid {
          display: grid !important;
        }
        
        [data-pdf-capture="true"] .grid-cols-2 {
          grid-template-columns: repeat(2, 1fr) !important;
        }
        
        [data-pdf-capture="true"] .grid-cols-3 {
          grid-template-columns: repeat(3, 1fr) !important;
        }
        
        [data-pdf-capture="true"] .grid-cols-4 {
          grid-template-columns: repeat(4, 1fr) !important;
        }
        
        [data-pdf-capture="true"] .grid-cols-5 {
          grid-template-columns: repeat(5, 1fr) !important;
        }
        
        [data-pdf-capture="true"] .gap-2 {
          gap: 4px !important;
        }
        
        /* Flex layouts */
        [data-pdf-capture="true"] .flex {
          display: flex !important;
        }
        
        [data-pdf-capture="true"] .flex-wrap {
          flex-wrap: wrap !important;
        }
        
        [data-pdf-capture="true"] .gap-1 {
          gap: 2px !important;
        }
        
        [data-pdf-capture="true"] .gap-3 {
          gap: 6px !important;
        }
        
        [data-pdf-capture="true"] .justify-center {
          justify-content: center !important;
        }
        
        [data-pdf-capture="true"] .justify-between {
          justify-content: space-between !important;
        }
        
        [data-pdf-capture="true"] .items-center {
          align-items: center !important;
        }
        
        [data-pdf-capture="true"] .items-start {
          align-items: flex-start !important;
        }
        
        /* Text alignment */
        [data-pdf-capture="true"] .text-center {
          text-align: center !important;
        }
        
        [data-pdf-capture="true"] .text-right {
          text-align: right !important;
        }
        
        /* Typography */
        [data-pdf-capture="true"] .text-2xl {
          font-size: 24px !important;
          line-height: 1.2 !important;
        }
        
        [data-pdf-capture="true"] .text-lg {
          font-size: 18px !important;
          line-height: 1.3 !important;
        }
        
        [data-pdf-capture="true"] .text-base {
          font-size: 16px !important;
          line-height: 1.4 !important;
        }
        
        [data-pdf-capture="true"] .text-sm {
          font-size: 14px !important;
          line-height: 1.3 !important;
        }
        
        [data-pdf-capture="true"] .text-xs {
          font-size: 12px !important;
          line-height: 1.2 !important;
        }
        
        [data-pdf-capture="true"] .font-bold {
          font-weight: bold !important;
        }
        
        [data-pdf-capture="true"] .font-semibold {
          font-weight: 600 !important;
        }
        
        [data-pdf-capture="true"] .font-medium {
          font-weight: 500 !important;
        }
        
        /* Colors */
        [data-pdf-capture="true"] .text-gray-900 {
          color: #111827 !important;
        }
        
        [data-pdf-capture="true"] .text-gray-700 {
          color: #374151 !important;
        }
        
        [data-pdf-capture="true"] .text-gray-600 {
          color: #4b5563 !important;
        }
        
        /* Hide elements not needed in PDF */
        [data-pdf-capture="true"] .print\\:hidden {
          display: none !important;
        }
        
        /* SVG icons */
        [data-pdf-capture="true"] svg {
          width: 12px !important;
          height: 12px !important;
          display: inline-block !important;
          vertical-align: middle !important;
        }
      `;
      document.head.appendChild(printStyles);

      // Add the PDF-specific data attribute to the target element
      const element = targetRef.current;
      const originalDataAttr = element.getAttribute('data-pdf-capture');
      element.setAttribute('data-pdf-capture', 'true');

      // Wait for styles to apply and any dynamic content to render
      await new Promise(resolve => setTimeout(resolve, 800));

      // Get the full dimensions
      const fullHeight = Math.max(element.scrollHeight, element.offsetHeight);
      const fullWidth = 794; // Fixed A4 width in pixels

      // Create canvas with proper dimensions for full-width capture
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: fullWidth,
        height: fullHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: fullWidth,
        windowHeight: fullHeight,
        x: 0,
        y: 0,
        logging: false,
        imageTimeout: 0,
        removeContainer: false,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);

      // Create PDF with proper sizing
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
        compress: true
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 595.28 pts
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 841.89 pts
      const imgWidth = canvas.width / 2; // Divide by scale
      const imgHeight = canvas.height / 2; // Divide by scale

      // Scale to fit full width with minimal margins
      const scaleX = (pdfWidth - 20) / imgWidth; // 10pt margin on each side
      //const scaleY = (pdfHeight - 20) / imgHeight; // 10pt margin top/bottom
      const scale = Math.min(scaleX, 1); // Don't scale up, but use full width

      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;

      // Center with minimal margins
      const offsetX = (pdfWidth - scaledWidth) / 2;
      const offsetY = 10; // Small top margin

      // If content is taller than one page, split across multiple pages
      if (scaledHeight > (pdfHeight - 40)) { // Account for margins
        const usablePageHeight = pdfHeight - 40; // 20pt margins top/bottom
        const pagesNeeded = Math.ceil(scaledHeight / usablePageHeight);
        
        for (let page = 0; page < pagesNeeded; page++) {
          if (page > 0) {
            pdf.addPage();
          }
          
          // Calculate the portion of the image for this page
          const sourceYPx = (page * usablePageHeight / scale) * 2; // Convert to canvas pixels
          const sourceHeightPx = Math.min((usablePageHeight / scale) * 2, (canvas.height - sourceYPx));
          
          // Create a temporary canvas for this page portion
          const pageCanvas = document.createElement('canvas');
          const pageCtx = pageCanvas.getContext('2d');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sourceHeightPx;
          
          if (pageCtx) {
            // Fill with white background
            pageCtx.fillStyle = '#ffffff';
            pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            
            // Draw the portion of the original image
            pageCtx.drawImage(
              canvas,
              0, sourceYPx, // Source x, y
              canvas.width, sourceHeightPx, // Source width, height
              0, 0, // Dest x, y
              canvas.width, sourceHeightPx // Dest width, height
            );
            
            const pageImgData = pageCanvas.toDataURL("image/png", 1.0);
            pdf.addImage(
              pageImgData,
              "PNG",
              offsetX,
              offsetY,
              scaledWidth,
              Math.min(usablePageHeight, (sourceHeightPx / 2) * scale)
            );
          }
        }
      } else {
        // Single page - simple case
        pdf.addImage(
          imgData,
          "PNG",
          offsetX,
          offsetY,
          scaledWidth,
          scaledHeight
        );
      }

      // Save the PDF
      pdf.save("resume.pdf");

      // Restore original styles and attributes
      if (originalDataAttr) {
        element.setAttribute('data-pdf-capture', originalDataAttr);
      } else {
        element.removeAttribute('data-pdf-capture');
      }
      document.head.removeChild(printStyles);
      document.body.style.overflow = originalOverflow;
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("There was an error generating the PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          PDF Preview
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          This will generate a full-width PDF with minimal margins, maximizing your content space while maintaining professional formatting.
        </p>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded">
          <span>Format: A4 Portrait (Full Width)</span>
          <span>Quality: High Resolution</span>
        </div>
        
        <Button 
          className="w-full font-medium" 
          onClick={handleDownload}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating PDF...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Full-Width Resume PDF
            </div>
          )}
        </Button>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p className="flex items-center">
          <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
          Full-width layout with minimal margins
        </p>
        <p className="flex items-center">
          <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
          Professional Times New Roman font
        </p>
        <p className="flex items-center">
          <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
          Auto-pagination for long content
        </p>
        <p className="flex items-center">
          <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
          Optimized for ATS systems
        </p>
      </div>
    </div>
  );
}