"""Create a quiet synthesized train / stove soundscape without external media."""
from pathlib import Path
import wave
import numpy as np
rate=48000; duration=10; n=rate*duration
rng=np.random.default_rng(83); t=np.arange(n)/rate
freq=np.fft.rfftfreq(n,1/rate)
def noise(cutoff):
 x=rng.normal(0,1,n)
 spectrum=np.fft.rfft(x); spectrum *= 1/(1+(freq/cutoff)**4)
 out=np.fft.irfft(spectrum,n); return out/max(np.std(out),1e-9)
rumble=noise(180)*.045 + np.sin(2*np.pi*53*t)*.022 + np.sin(2*np.pi*79*t)*.012
rail=np.zeros(n)
for start in np.arange(.35,duration,.72):
 for delay,gain in [(0,.055),(.11,.035)]:
  rel=t-(start+delay); mask=(rel>=0)&(rel<.14)
  rail[mask] += gain*np.exp(-rel[mask]*35)*np.sin(2*np.pi*125*rel[mask])
train=rumble+rail+noise(1500)*.009
memory=np.clip((t-4)/.4,0,1)*np.clip((6.5-t)/.4,0,1)
hiss=noise(6000)*.018
mix=train*(1-.65*memory)+hiss*memory
fade=np.minimum(np.clip(t/.25,0,1),np.clip((duration-t)/.5,0,1))
left=mix*fade; right=(mix*.97+noise(1000)*.003)*fade
stereo=np.column_stack([left,right]); stereo=np.clip(stereo,-.9,.9)
p=Path('assets/scenarios/train-ambience.wav')
with wave.open(str(p),'wb') as f:
 f.setnchannels(2);f.setsampwidth(2);f.setframerate(rate);f.writeframes((stereo*32767).astype('<i2').tobytes())
print(p, '10s stereo synthesized ambience; peak',float(np.max(np.abs(stereo))))
