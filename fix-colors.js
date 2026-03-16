const fs = require('fs');

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Specific Dashboard gradient
    content = content.replace(/bg-\[linear-gradient\([^\]]+\)\]/g, 'bg-card');

    // 2. Shadows (simplify those complex static-color shadows)
    content = content.replace(/shadow-\[inset[^\]]+\]/g, 'shadow-sm');
    content = content.replace(/shadow-\[0_30px_70px[^\]]+\]/g, 'shadow-lg');
    content = content.replace(/shadow-\[0_24px_44px[^\]]+\]/g, 'shadow-md');
    // keep primary/colored shadows!
    content = content.replace(/shadow-\[0_[^\]]+rgba\(15,23,42[^\]]+\]/g, 'shadow-sm');

    // 3. Texts
    content = content.replace(/text-slate-900 dark:text-white/g, 'text-foreground');
    content = content.replace(/text-slate-900/g, 'text-foreground');
    content = content.replace(/text-slate-800 dark:text-slate-200/g, 'text-foreground');
    content = content.replace(/text-slate-800/g, 'text-foreground');
    content = content.replace(/text-slate-700 dark:text-slate-300/g, 'text-foreground');
    content = content.replace(/text-slate-700\/80 dark:text-primary\/80/g, 'text-primary/80');
    content = content.replace(/text-slate-700\/80/g, 'text-foreground/80');
    content = content.replace(/text-slate-700/g, 'text-foreground');
    content = content.replace(/text-slate-600 dark:text-slate-[34]00/g, 'text-muted-foreground');
    content = content.replace(/text-slate-600/g, 'text-muted-foreground');
    content = content.replace(/text-slate-500 dark:text-slate-400/g, 'text-muted-foreground');
    content = content.replace(/text-slate-500/g, 'text-muted-foreground');
    content = content.replace(/text-slate-400 dark:text-slate-500/g, 'text-muted-foreground');
    content = content.replace(/text-slate-400/g, 'text-muted-foreground');
    content = content.replace(/text-slate-300/g, 'text-muted-foreground');
    content = content.replace(/text-slate-[23]00/g, 'text-muted-foreground');

    // dark: overrides for text are now redundant if we mapped them to foreground
    content = content.replace(/dark:text-white/g, '');
    content = content.replace(/dark:text-slate-[0-9]00/g, '');
    content = content.replace(/dark:text-slate-[0-9]00\/[0-9]+/g, '');

    // 4. Backgrounds
    content = content.replace(/bg-white\/[0-9]+ dark:bg-white\/[0-9]+/g, 'bg-card');
    content = content.replace(/bg-white\/[0-9]+/g, 'bg-card');
    content = content.replace(/bg-white/g, 'bg-card');
    
    content = content.replace(/bg-slate-50 dark:bg-slate-[89]50\/[0-9]+/g, 'bg-secondary');
    content = content.replace(/bg-slate-50/g, 'bg-secondary');
    content = content.replace(/bg-slate-100 dark:bg-slate-800/g, 'bg-secondary');
    content = content.replace(/bg-slate-100/g, 'bg-secondary');
    
    content = content.replace(/bg-slate-200 dark:bg-slate-800/g, 'bg-secondary');
    content = content.replace(/bg-slate-200/g, 'bg-secondary');
    
    content = content.replace(/bg-slate-[89]00 dark:bg-slate-900/g, 'bg-card');
    content = content.replace(/bg-slate-[89]00/g, 'bg-card');

    content = content.replace(/bg-slate-[0-9]+\/[0-9]+ dark:bg-slate-[0-9]+\/[0-9]+/g, 'bg-secondary');
    content = content.replace(/dark:bg-[a-z]+-[0-9]+(\/[0-9]+)?/g, ''); // strip remaining dark:bg-

    content = content.replace(/bg-card\/[0-9]+/g, 'bg-card'); // simplify
    
    // 5. Borders
    content = content.replace(/border-slate-[234]00\/[0-9]+ dark:border-white\/[0-9]+/g, 'border-border');
    content = content.replace(/border-slate-[234]00\/[0-9]+ dark:border-slate-[78]00/g, 'border-border');
    content = content.replace(/border-slate-[234]00\/[0-9]+/g, 'border-border');
    content = content.replace(/border-slate-[234]00/g, 'border-border');
    
    content = content.replace(/border-white\/[0-9]+ dark:border-white\/[0-9]+/g, 'border-border');
    content = content.replace(/border-white\/[0-9]+/g, 'border-border');
    
    content = content.replace(/border-slate-[78]00/g, 'border-border');
    content = content.replace(/dark:border-[a-z]+-[0-9]+(\/[0-9]+)?/g, ''); // strip remaining dark:border

    // 6. Gradients
    content = content.replace(/from-slate-200\/70 via-card to-slate-200\/30/g, 'from-border/50 via-background to-border/50');
    content = content.replace(/from-slate-[23]00\/[0-9]+ to-transparent/g, 'from-border to-transparent');
    
    // 7. Hovers that were hardcoded
    content = content.replace(/hover:bg-slate-100/g, 'hover:bg-secondary');
    content = content.replace(/hover:bg-slate-50/g, 'hover:bg-secondary');
    content = content.replace(/hover:text-slate-[89]00/g, 'hover:text-foreground');
    content = content.replace(/dark:hover:text-white/g, '');
    content = content.replace(/dark:hover:bg-slate-800/g, '');
    content = content.replace(/dark:hover:border-[^\s"']+/g, '');

    // Extra specific cleanup just for SymptomPicker string matches that didn't fully convert
    content = content.replace(/from-border\/[0-9]+ via-white\/40 to-border\/[0-9]+ dark:from-foreground\/[0-9]+ dark:via-white\/5 dark:to-transparent/g, "from-border via-background/40 to-border");
    content = content.replace(/from-slate-200\/70 via-white\/40 to-slate-200\/30 opacity-0 blur-2xl transition-opacity duration-500 group-focus-within:opacity-100 dark:from-white\/10 dark:via-white\/5 dark:to-transparent/g, "from-border/50 via-background/50 to-border/50 opacity-0 blur-2xl transition-opacity duration-500 group-focus-within:opacity-100");
    
    content = content.replace(/dark:text-slate-[0-9]00/g, '');
    content = content.replace(/dark:bg-white(\/[0-9]+)?/g, '');
    content = content.replace(/dark:border-white(\/[0-9]+)?/g, '');
    content = content.replace(/dark:from-white(\/[0-9]+)?/g, '');
    content = content.replace(/dark:via-white(\/[0-9]+)?/g, '');

    // cleanup empty dark: classes
    content = content.replace(/dark:\s+/g, '');
    // clean multiple spaces
    content = content.replace(/\s{2,}/g, ' ');

    fs.writeFileSync(filePath, content);
}

const files = [
    'src/app/dashboard/page.tsx',
    'src/components/prediction/SymptomPicker.tsx',
    'src/components/prediction/QuickStatBadge.tsx',
    'src/components/layout/TopBar.tsx',
    'src/components/layout/Sidebar.tsx'
];

files.forEach(f => {
    try {
        if(fs.existsSync(f)) {
            fixFile(f);
            console.log('Fixed', f);
        }
    } catch(e) { console.error('Error on', f, e.message); }
});
