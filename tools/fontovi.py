#!/usr/bin/env python3
"""Pisma za tekst i naslove: jedna datoteka po pismu, samo sa znakovima koje aplikacija koristi
   (plus latinica, hrvatska slova i interpunkcija). Pokreni ponovno kad u sadržaj dođe novi znak:
   znak kojeg u datoteci nema ispisuje se rezervnim pismom sustava.

     pip install fonttools brotli
     python3 tools/fontovi.py MAPA_S_IZVORIMA

   U mapi s izvorima trebaju biti varijabilni TTF-ovi s github.com/google/fonts (OFL, bez rezerviranog imena):
   "Newsreader[opsz,wght].ttf", "Newsreader-Italic[opsz,wght].ttf", "HankenGrotesk[wght].ttf".
   IBM Plex Mono se ne dira: njegova licenca rezervira ime, pa su u assets/fonts IBM-ove izvorne datoteke.
   Ispis: veličine i znakovi koje pismo nema."""
import glob,re,os,sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset
R=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','')
S=os.path.join(sys.argv[1],'') if len(sys.argv)>1 else sys.exit(__doc__)
O=R+'assets/fonts/'
txt=''.join(open(f,encoding='utf-8').read() for f in [R+'index.html']+glob.glob(R+'assets/js/*.js'))
chars={c for c in txt if ord(c)>=0x20 and not (0xD800<=ord(c)<=0xDFFF)}
chars|={chr(c) for c in range(0x20,0x7F)}|{chr(c) for c in range(0xA0,0x100)}
chars|=set('ČčĆćĐđŠšŽž„“”‚‘’…–—·•°′″×÷−±≈≠≤≥→←↑↓↔✓✗€™‰ ')
uni=sorted(ord(c) for c in chars)
FEAT=['calt','ccmp','clig','curs','kern','liga','locl','mark','mkmk','rclt','rlig','rvrn','tnum','lnum','pnum','onum','case','zero','frac','sups','ordn','dnom','numr']
def make(src,out,axes,keep_uni=None):
    f=TTFont(S+src)
    if axes:
        f=instancer.instantiateVariableFont(f,axes); f.save(O+'_tmp.ttf'); f=TTFont(O+'_tmp.ttf'); os.remove(O+'_tmp.ttf')
    o=subset.Options(); o.flavor='woff2'; o.layout_features=FEAT; o.name_IDs=[0,1,2,3,4,5,6,13,14]; o.notdef_outline=True; o.hinting=False
    s=subset.Subsetter(o); s.populate(unicodes=keep_uni or uni); s.subset(f)
    f.flavor='woff2'; f.save(O+out)
    cmap=set(f.getBestCmap().keys()); miss=[chr(u) for u in (keep_uni or uni) if u not in cmap and chr(u) in txt]
    print('%-34s %6.1f kB  glifova %4d  nema: %s'%(out,os.path.getsize(O+out)/1024,len(f.getGlyphOrder()),''.join(miss)[:80]))
make('Newsreader[opsz,wght].ttf','newsreader-hr.woff2',{'opsz':16,'wght':(370,600)})
make('Newsreader-Italic[opsz,wght].ttf','newsreader-hr-italic.woff2',{'opsz':16,'wght':(370,600)})
make('HankenGrotesk[wght].ttf','hanken-grotesk-hr.woff2',{'wght':(500,600)})
