const fs = require('fs');

const inputFile = 'C:\\Users\\danie\\Documents\\Projects\\lordmagick-app\\src\\app\\the-magick-psychic-school\\psychic-training\\geo-tag\\targetData.ts';
const outputFile = inputFile; // Overwrite in place

try {
  let content = fs.readFileSync(inputFile, 'utf8');
  
  // Extract the array content. It's between `ANCIENT: [` and `],`
  // Actually, there are multiple categories: ANCIENT, ARCHITECTURAL, NATURAL, URBAN.
  // The structure is `KEY: [ ... ],`
  
  // We need to parse eaach line of the object definitions.
  // A typical line:
  // { name: "Name", region: "Reg", lat: 123, lng: 456, Tag1, Tag2... },
  
  const lines = content.split('\n');
  const newLines = [];
  
  for (let line of lines) {
    if (line.trim().startsWith('{') && line.includes('lat:') && line.includes('lng:')) {
      // This is a data line. 
      // We need to capture the standard fields and the tags.
      
      // Regex to capture the standard part and the "rest"
      // Standard part ends at `lng: [number],` or `lng: [number] }`? 
      // In the file it's `lng: -72.545, South-America, ...`
      
      const match = line.match(/(\{.*name:.*lng:\s*-?[\d\.]+),/);
      
      if (match) {
        const standardPart = match[1]; // "{ name: ..., lng: ..." without the trailing comma
        const afterLng = line.substring(match.index + match[0].length).trim();
        
        // afterLng should be "Tag1, Tag2, ... },"
        // Remove trailing "}," or "}"
        let cleanTags = afterLng.replace(/\},?$/, '').trim();
        
        // Split by comma
        const tags = cleanTags.split(',').map(s => s.trim()).filter(s => s);
        
        // Reconstruct
        const newEntry = `${standardPart}, tags: ${JSON.stringify(tags)} },`;
        newLines.push(newEntry);
      } else {
         // Maybe formatting is different or it's valid?
         // If it's the specific invalid format, we fix it.
         // If we can't match, we keep line as is (or log error)
         newLines.push(line); 
      }
    } else {
      newLines.push(line);
    }
  }
  
  // We also need to add the `tags` field to the interface definition at the top
  const interfaceRegex = /export interface TargetLocation\s*\{([\s\S]*?)\}/;
  const newContent = newLines.join('\n').replace(interfaceRegex, (match, body) => {
      if (!body.includes('tags:')) {
          return `export interface TargetLocation {${body}  tags: string[];\n}`;
      }
      return match;
  });

  fs.writeFileSync(outputFile, newContent);
  console.log('Successfully rewrote targetData.ts with tags');
  
} catch (e) {
  console.error('Error:', e);
}
