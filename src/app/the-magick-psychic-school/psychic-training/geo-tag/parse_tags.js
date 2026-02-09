const fs = require('fs');
const path = require('path');

const filePath = 'C:\\Users\\danie\\Documents\\Projects\\lordmagick-app\\src\\app\\the-magick-psychic-school\\psychic-training\\geo-tag\\tag-groups.ts';

try {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const groups = [];
  let currentGroup = null;

  const groupRegex = /(?:Group\s+)?([\d\.]+)\s*[:\(](.*?)(?:\)|$)/;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    const match = line.match(groupRegex);
    if (match) {
        if (currentGroup) {
            groups.push(currentGroup);
        }
        // Start new group
        const id = match[1].trim();
        let name = match[2].trim().replace(/^\(/, '').replace(/\)$/, ''); // Clean parens
        
        // Sometimes the tags are on the same line?
        // Pattern: "Group 5.1: 2nd Millennium CE (1000 to Present) Modern, Contemporary..."
        // If there are tags after the name definition, we need to split them.
        // But the format in the file is inconsistent. 
        // Example: "Group 5.1: 2nd Millennium CE (1000 to Present) Modern, Contemporary..."
        // The name might be "2nd Millennium CE (1000 to Present)" and tags "Modern, Contemporary..."
        
        // Let's look for the first comma or known tag start? No, tricky.
        // Heuristic: If there are commas, it's likely tags.
        // But the name itself might contain commas? Unlikely for "Group X".
        
        let tags = [];
        // Check if the line continues with tags
        // The regex Match[0] is the "Group X: Name" part.
        // Wait, "Group 5.1: 2nd Millennium CE (1000 to Present) Modern, Contemporary..."
        // My regex `(?:Group\s+)?([\d\.]+)\s*[:\(](.*?)(?:\)|$)` matches "Group 5.1: 2nd Millennium CE (1000 to Present)"
        // It might not capturing the rest of the line if it's not in parens?
        
        // Let's simplify.
        // If line starts with "Group" or a number followed by colon/dot?
        
        // Re-reading file content style:
        // "Group 1: (Very Large Numbers)" -> Next line: "100000, 150000..."
        // "Group 5.1: 2nd Millennium CE (1000 to Present) Modern, Contemporary..." -> Tags on SAME line.
        
        // Detection:
        const colonIndex = line.indexOf(':');
        const isHeader = line.toLowerCase().startsWith('group') || (colonIndex > -1 && colonIndex < 10 && !isNaN(parseFloat(line.substring(0, colonIndex))));

        if (isHeader) {
             // It's a header.
             // Extract ID and Name.
             // If there is text AFTER the name that looks like tags (commas), treat as tags.
             
             // Simple parser: Split by first colon.
             const parts = line.split(':');
             const groupIdentity = parts[0].trim(); // "Group 5.1"
             let remainder = parts.slice(1).join(':').trim(); // "2nd Millennium CE... Modern, ..."
             
             // Extract name. Usually up to first parenthesis end? or just take it all?
             // "2nd Millennium CE (1000 to Present) Modern, Contemporary..."
             // Name: "2nd Millennium CE (1000 to Present)"
             // Tags: "Modern, Contemporary..."
             
             // Detect usage of tags on same line:
             // If there are commas, split by commas? 
             // Issues: "Very Large Numbers" (no comma).
             
             let extractedTags = [];
             
             // Special handling for the file format seen
             if (remainder.startsWith('(')) {
                 // "(Very Large Numbers)"
                 const closeParen = remainder.indexOf(')');
                 if (closeParen > -1) {
                     name = remainder.substring(1, closeParen);
                     const possibleTags = remainder.substring(closeParen + 1).trim();
                     if (possibleTags) extractedTags = possibleTags.split(',').map(s => s.trim()).filter(s => s);
                 } else {
                     name = remainder;
                 }
             } else {
                 // "2nd Millennium CE (1000 to Present) Modern, Contemporary..."
                 // Maybe look for start of tags? 
                 // It seems tags are separated by commas. Name might just be the first bit?
                 // Let's assume the name is the text before the first comma? 
                 // Or before the first word that starts with a capital letter after a space?
                 
                 // Let's just use the whole remainder as name for now, and see if next lines have tags.
                 // Correction: For Group 5.1, tags ARE on the same line.
                 // "Modern, Contemporary, ..."
                 // Let's split by comma. The first part is Name + First Tag?
                 // "2nd Millennium CE (1000 to Present) Modern"
                 
                 // Maybe I should look at the "Group 5.1" structure in the file again.
                 // It's specific.
                 
                 const firstComma = remainder.indexOf(',');
                 if (firstComma > -1) {
                     // Assume the semantic break is before the first comma's preceding word?
                     // Or just treat the whole thing as a name and we refine per group manually?
                     // No, "Modern" is a tag.
                     
                     // Let's try to split by ')' if present?
                     const closeParen = remainder.lastIndexOf(')');
                     if (closeParen > -1) {
                         name = remainder.substring(0, closeParen + 1).trim();
                         const possibleTags = remainder.substring(closeParen + 1).trim();
                         if (possibleTags) extractedTags = possibleTags.split(',').map(s => s.trim()).filter(s => s);
                     } else {
                         // Fallback: Split by first comma, but keep first part as name?
                         // "Group 13.9: Public Squares & Managed Landscapes" -> No tags on line.
                         name = remainder;
                     }
                 } else {
                     name = remainder;
                 }
             }
             
            // Clean name
            name = name.replace(/^(\(|\)|:)+|(\(|\)|:)+$/g, '').trim();

            currentGroup = { id: groupIdentity, name, tags: extractedTags };
            
        } else {
             // Line contains tags
             const lineTags = line.split(',').map(s => s.trim()).filter(s => s);
             if (currentGroup) {
                 currentGroup.tags.push(...lineTags);
             }
        }
    } else {
        // Just tags
             const lineTags = line.split(',').map(s => s.trim()).filter(s => s);
             if (currentGroup) {
                 currentGroup.tags.push(...lineTags);
             } else if (line.trim().startsWith('Here are')) {
                 // ignore header
             }
    }
  }
  if (currentGroup) groups.push(currentGroup);

  // Generate TS
  const output = `export interface TagGroup {
  id: string;
  name: string;
  tags: string[];
}

export const TAG_GROUPS: TagGroup[] = ${JSON.stringify(groups, null, 2)};
`;

  fs.writeFileSync(filePath, output);
  console.log('Successfully rewrote tag-groups.ts');

} catch (e) {
  console.error('Error parsing:', e);
}
