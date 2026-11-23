#!/usr/bin/env python3
"""Kontrast parova tokena iz assets/css/app.css, za dan i noć (WCAG 2). Pokreni nakon svake promjene boja:
     python3 tools/kontrast.py
   Ispisuje parove ispod praga; izlazni kod 1 ako ih ima."""
import os,re,sys
import math, sys
def oklch(L,C,H):
    L/=100; a=C*math.cos(math.radians(H)); b=C*math.sin(math.radians(H))
    l_=L+0.3963377774*a+0.2158037573*b; m_=L-0.1055613458*a-0.0638541728*b; s_=L-0.0894841775*a-1.2914855480*b
    l,m,s=l_**3,m_**3,s_**3
    r= 4.0767416621*l-3.3077115913*m+0.2309699292*s
    g=-1.2684380046*l+2.6097574011*m-0.3413193965*s
    b_=-0.0041960863*l-0.7034186147*m+1.7076147010*s
    return r,g,b_
def lum(rgb): return 0.2126*max(0,rgb[0])+0.7152*max(0,rgb[1])+0.0722*max(0,rgb[2])
def hexc(rgb):
    def f(x):
        x=min(1,max(0,x)); x=12.92*x if x<=0.0031308 else 1.055*x**(1/2.4)-0.055
        return round(x*255)
    return '#%02x%02x%02x'%tuple(f(x) for x in rgb)
def cr(a,b):
    la,lb=lum(oklch(*a)),lum(oklch(*b)); hi,lo=max(la,lb),min(la,lb); return (hi+.05)/(lo+.05)
def gamut(c):
    r=oklch(*c); return all(-0.002<=x<=1.002 for x in r)
s=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','assets','css','app.css'),encoding='utf-8').read()
def block(pattern):
    # zadnji blok koji počinje na početku retka: dnevni tokeni su zadnji u izvoru, a blok za ispis je uvučen u @media
    i=[m.start() for m in re.finditer(pattern,s,flags=re.M)][-1]; j=s.index('}',i); return dict(re.findall(r'(--[\w-]+):\s*([^;]+);',s[i:j]))
day=block(r'^:root\{'); night=dict(day); night.update(block(r'^:root\[data-theme="night"\]\{'))
def val(t,k,d=0):
    v=t[k].strip()
    m=re.fullmatch(r'var\((--[\w-]+)\)',v)
    if m and d<5: return val(t,m.group(1),d+1)
    m=re.match(r'oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)',v)
    if m: return lum(oklch(float(m.group(1)),float(m.group(2)),float(m.group(3))))
    m=re.fullmatch(r'#([0-9a-f]{3,6})',v)
    if m:
        h=m.group(1); h=''.join(c*2 for c in h) if len(h)==3 else h
        f=lambda x:(x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4); r,g,b=[f(int(h[i:i+2],16)/255) for i in (0,2,4)]; return .2126*r+.7152*g+.0722*b
    raise ValueError(k+' '+v)
PAIRS=[('--txt','--bg',7),('--txt2','--bg',7),('--txt2','--bg2',7),('--txt2','--bg3',4.5),('--txt2','--panel',7),('--txt2','--panel2',7),('--txt3','--bg',4.5),('--txt3','--bg2',4.5),('--txt3','--bg3',4.5),('--txt3','--panel',4.5),('--txt3','--panel2',4.5),
 ('--acc-t','--bg',4.5),('--acc-t','--bg2',4.5),('--acc-t','--bg3',4.5),('--acc-t','--panel',4.5),('--acc-t','--panel2',4.5),('--acc-ink','--acc',4.5),('--acc-ink','--acc2',4.5),('--on-navy','--navy',7),
 ('--green','--bg',4.5),('--green','--bg2',4.5),('--green','--panel',4.5),('--green','--green-tint',4.5),('--red','--bg',4.5),('--red','--bg2',4.5),('--red','--panel',4.5),('--red','--red-tint',4.5),('--yellow','--bg',4.5),('--yellow','--bg2',4.5),('--yellow','--panel',4.5),('--orange','--bg',4.5),('--orange','--panel',4.5),
 ('--txt','--green-tint',7),('--txt','--red-tint',7),('--txt','--land',4.5),('--txt','--sea',4.5),('--lcd-ink','--lcd',4.5),('--line2','--bg',3),('--line2','--panel',3),('--txt3','--panel',3),('--sig-white','--plate',3)]   # prsten fokusa na tamnoj ploči je bijel, ne magenta
bad=0
for name,t in (('dan',day),('noć',night)):
    for a,b,mn in PAIRS:
        la,lb=val(t,a),val(t,b); r=(max(la,lb)+.05)/(min(la,lb)+.05)
        if r<mn: bad+=1; print('%s  %-10s na %-13s %.2f < %g'%(name,a,b,r,mn))
print('parova:',len(PAIRS)*2,'ispod praga:',bad)
sys.exit(1 if bad else 0)
