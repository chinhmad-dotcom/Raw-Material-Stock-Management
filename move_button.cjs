const fs = require('fs');

let code = fs.readFileSync('frontend/src/components/fans/FanPlanForm.tsx', 'utf8');

const originalButton = `        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
          Lưu
        </button>`;

// Remove the button from the top
code = code.replace(originalButton, '');

// Add the button at the bottom of the form
const newButtonContainer = `        <div className="flex justify-center mt-3">
          <button 
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 min-w-[120px]"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Lưu Kế Hoạch
          </button>
        </div>`;

code = code.replace(
  '          </div>\n        </div>\n      </form>',
  '          </div>\n        </div>\n' + newButtonContainer + '\n      </form>'
);

fs.writeFileSync('frontend/src/components/fans/FanPlanForm.tsx', code);
console.log('Button moved successfully');
