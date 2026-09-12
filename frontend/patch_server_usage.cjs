const fs = require('fs');
let code = fs.readFileSync('../mock-api/server.js', 'utf8');

const oldCheckMachineBlock = `                        if (hasEnd) {
                            if (key === 'lastCornEnd') r.electricity.e1 = endVal;
                            else if (key === 'lastFfsEnd') r.electricity.e2 = endVal;
                            else if (key === 'lastLineEnd') r.electricity.line = endVal;
                            else if (key === 'lastNghienEnd') r.electricity.hamer = endVal;
                        } else if (hasStart) {
                            if (key === 'lastCornEnd') r.electricity.e1 = startVal;
                            else if (key === 'lastFfsEnd') r.electricity.e2 = startVal;
                            else if (key === 'lastLineEnd') r.electricity.line = startVal;
                            else if (key === 'lastNghienEnd') r.electricity.hamer = startVal;
                        }`;

const newCheckMachineBlock = `                        if (hasStart && hasEnd) {
                            const usage = endVal - startVal;
                            if (usage > 0) {
                                if (key === 'lastCornEnd') r.electricity.e1 = (r.electricity.e1 || 0) + usage;
                                else if (key === 'lastFfsEnd') r.electricity.e2 = (r.electricity.e2 || 0) + usage;
                                else if (key === 'lastLineEnd') r.electricity.line = (r.electricity.line || 0) + usage;
                                else if (key === 'lastNghienEnd') r.electricity.hamer = (r.electricity.hamer || 0) + usage;
                            }
                        }`;

code = code.replace(oldCheckMachineBlock, newCheckMachineBlock);
fs.writeFileSync('../mock-api/server.js', code);
console.log('Patched mock-api to calculate consumption');
