const fs = require('fs');
const { mdToPdf } = require('md-to-pdf');

(async () => {
    try {
        console.log("Generating PDF... Please wait, this might take a few seconds as it processes the markdown.");
        
        // Read the markdown file and convert it to PDF
        const pdf = await mdToPdf({ path: 'Project_Report.md' }).catch(console.error);
        
        if (pdf) {
            fs.writeFileSync('Project_Report.pdf', pdf.content);
            console.log("✅ Success! 'Project_Report.pdf' has been created in your folder.");
        } else {
            console.log("❌ Failed to generate PDF.");
        }
    } catch (error) {
        console.error("Error generating PDF:", error);
    }
})();
