"""Synthesized idling traffic and intermittent impatient horns from behind."""
from pathlib import Path
import wave
import numpy as np
rate=48000;n=10*rate;t=np.arange(n)/rate;rng=np.random.default_rng(94)
freq=np.fft.rfftfreq(n,1/rate)
noise=rng.normal(0,1,n)
low=np.fft.irfft(np.fft.rfft(noise)/(1+(freq/140)**4),n);low/=np.std(low)
engine=low*.025+np.sin(2*np.pi*47*t)*.014+np.sin(2*np.pi*94*t)*.008
horn=np.zeros(n)
for start,duration in [(2,.28),(2.65,.36),(4.35,.95),(5.65,.3),(6.2,.4),(7.25,1.25),(8.95,.45)]:
 u=t-start;mask=(u>=0)&(u<duration);v=u[mask]
 envelope=np.minimum(np.clip(v/.035,0,1),np.clip((duration-v)/.07,0,1))
 tone=sum(gain*np.sin(2*np.pi*f*v+0.03*np.sin(2*np.pi*5*v)) for f,gain in [(350,.085),(440,.075),(700,.02),(880,.016)])
 horn[mask]+=tone*envelope
fade=np.minimum(np.clip(t/.3,0,1),np.clip((10-t)/.35,0,1))
stereo=np.column_stack([(engine+horn*.94)*fade,(engine*.96+horn)*fade])
p=Path('assets/scenarios/traffic-ambience.wav')
with wave.open(str(p),'wb') as f:
 f.setnchannels(2);f.setsampwidth(2);f.setframerate(rate);f.writeframes((np.clip(stereo,-.9,.9)*32767).astype('<i2').tobytes())
print('Generated 10s stereo traffic audio; peak',float(np.max(np.abs(stereo))))
