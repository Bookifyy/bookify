const fs = require('fs');
const path = require('path');

const walk = (dir, done) => {
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(file => {
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walk(file, (err, res) => {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          if (file.endsWith('.tsx')) results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

walk('/home/mbokani-pr/bookify/apps/web/app', (err, results) => {
  if (err) throw err;
  results.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace primary wrapper black backgrounds
    content = content.replace(/min-h-screen bg-black/g, 'min-h-screen bg-background');
    content = content.replace(/bg-black text-white/g, 'bg-background text-foreground');
    content = content.replace(/bg-black text-zinc-300/g, 'bg-background text-foreground');
    content = content.replace(/bg-black/g, 'bg-background');
    content = content.replace(/bg-zinc-950/g, 'bg-background');
    
    // Replace hardcoded dark borders
    content = content.replace(/border-zinc-800/g, 'border-border');
    content = content.replace(/border-zinc-900/g, 'border-border');
    content = content.replace(/bg-zinc-800/g, 'bg-muted');

    // Replace dark mode text specifics safely
    content = content.replace(/text-white/g, 'text-foreground');
    content = content.replace(/text-zinc-200/g, 'text-foreground');
    content = content.replace(/text-zinc-400/g, 'text-muted-foreground');
    content = content.replace(/text-zinc-300/g, 'text-muted-foreground');
    content = content.replace(/text-zinc-500/g, 'text-muted-foreground');

    // Cards
    content = content.replace(/bg-zinc-900/g, 'bg-card');
    
    // Exceptions correction
    // If a button has text-foreground but it should be text-white, we fix it
    content = content.replace(/bg-indigo-600(.*?)text-foreground/g, 'bg-indigo-600$1text-white');
    content = content.replace(/bg-indigo-500(.*?)text-foreground/g, 'bg-indigo-500$1text-white');
    content = content.replace(/bg-blue-600(.*?)text-foreground/g, 'bg-blue-600$1text-white');
    content = content.replace(/bg-red-600(.*?)text-foreground/g, 'bg-red-600$1text-white');
    content = content.replace(/bg-red-500(.*?)text-foreground/g, 'bg-red-500$1text-white');
    content = content.replace(/bg-yellow-400(.*?)text-foreground/g, 'bg-yellow-400$1text-black');
    content = content.replace(/bg-\[\#FFD814\](.*?)text-foreground/g, 'bg-[#FFD814]$1text-black');
    content = content.replace(/text-foreground(.*?)bg-indigo-600/g, 'text-white$1bg-indigo-600');
    content = content.replace(/bg-green-500(.*?)text-foreground/g, 'bg-green-500$1text-white');
    
    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  });
});
