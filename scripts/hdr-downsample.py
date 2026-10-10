import sys, numpy as np

def read_hdr(path):
    f=open(path,'rb')
    if not f.readline().strip().startswith(b'#?'): raise ValueError('not radiance')
    while f.readline().strip()!=b'': pass
    d=f.readline().strip().split(); h,w=int(d[1]),int(d[3])
    data=np.zeros((h,w,4),dtype=np.uint8)
    for y in range(h):
        hd=f.read(4)
        if hd[0]==2 and hd[1]==2 and ((hd[2]<<8)|hd[3])==w:
            for c in range(4):
                x=0
                while x<w:
                    b=f.read(1)[0]
                    if b>128: data[y,x:x+b-128,c]=f.read(1)[0]; x+=b-128
                    else: data[y,x:x+b,c]=np.frombuffer(f.read(b),dtype=np.uint8); x+=b
        else:
            row=np.frombuffer(hd+f.read(w*4-4),dtype=np.uint8).reshape(w,4); data[y]=row
    e=data[:,:,3].astype(np.int32)
    scale=np.where(e==0,0.0,np.ldexp(1.0,e-136))
    return (data[:,:,:3].astype(np.float32)*scale[:,:,None])

def box_down(rgb,fy,fx):
    h,w,_=rgb.shape
    return rgb.reshape(h//fy,fy,w//fx,fx,3).mean(axis=(1,3))

def write_hdr(path,rgb):
    h,w,_=rgb.shape
    rgb=np.maximum(rgb,0.0)
    v=rgb.max(axis=2)
    m,e=np.frexp(np.where(v<1e-32,0.0,v))
    s=np.where(v<1e-32,0.0,m*256.0/np.where(v<1e-32,1.0,v))
    out=np.zeros((h,w,4),dtype=np.uint8)
    out[:,:,:3]=np.clip(rgb*s[:,:,None],0,255).astype(np.uint8)
    out[:,:,3]=np.where(v<1e-32,0,np.clip(e+128,0,255)).astype(np.uint8)
    f=open(path,'wb')
    f.write(b'#?RADIANCE\nFORMAT=32-bit_rle_rgbe\n\n')
    f.write(f'-Y {h} +X {w}\n'.encode())
    for y in range(h):
        f.write(bytes([2,2,(w>>8)&255,w&255]))
        for c in range(4):
            row=out[y,:,c]; x=0
            while x<w:
                run=1
                while x+run<w and run<127 and row[x+run]==row[x]: run+=1
                if run>=4:
                    f.write(bytes([128+run,row[x]])); x+=run
                else:
                    run=1
                    while x+run<w and run<128 and not (x+run+2<w and row[x+run]==row[x+run+1]==row[x+run+2]): run+=1
                    f.write(bytes([run])); f.write(row[x:x+run].tobytes()); x+=run
    f.close()

src,dst,fy,fx=sys.argv[1],sys.argv[2],int(sys.argv[3]),int(sys.argv[4])
rgb=read_hdr(src)
small=box_down(rgb,fy,fx)
write_hdr(dst,small)
print(f"{src.split('/')[-1]} {rgb.shape[1]}x{rgb.shape[0]} -> {dst.split('/')[-1]} {small.shape[1]}x{small.shape[0]}")
