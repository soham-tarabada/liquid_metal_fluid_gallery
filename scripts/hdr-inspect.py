import sys, struct, numpy as np
def read_hdr(path):
    f=open(path,'rb')
    if not f.readline().strip().startswith(b'#?'): raise ValueError('not radiance')
    while True:
        l=f.readline().strip()
        if l==b'': break
    dims=f.readline().strip().split()
    h,w=int(dims[1]),int(dims[3])
    data=np.zeros((h,w,4),dtype=np.uint8)
    for y in range(h):
        hdr=f.read(4)
        if len(hdr)<4: raise ValueError('eof')
        if hdr[0]==2 and hdr[1]==2 and ((hdr[2]<<8)|hdr[3])==w:
            for c in range(4):
                x=0
                while x<w:
                    b=f.read(1)[0]
                    if b>128:
                        v=f.read(1)[0]; data[y,x:x+b-128,c]=v; x+=b-128
                    else:
                        chunk=f.read(b); data[y,x:x+b,c]=np.frombuffer(chunk,dtype=np.uint8); x+=b
        else:
            rest=f.read(w*4-4)
            row=np.frombuffer(hdr+rest,dtype=np.uint8).reshape(w,4); data[y]=row
    e=data[:,:,3].astype(np.int32)
    scale=np.where(e==0,0.0,np.ldexp(1.0,e-136))
    rgb=data[:,:,:3].astype(np.float32)*scale[:,:,None]
    return rgb
for p in sys.argv[1:]:
    rgb=read_hdr(p)
    lum=rgb@np.array([0.2126,0.7152,0.0722],dtype=np.float32)
    print(f"{p.split('/')[-1]:<26} max={rgb.max():9.2f}  lum_max={lum.max():8.2f}  lum_mean={lum.mean():6.3f}  >1.0={100*(lum>1).mean():5.2f}%")
