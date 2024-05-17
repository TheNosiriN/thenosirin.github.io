// #define MARGIN
const float margin = 2.2;



vec3 pal( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ){
    return a + b*cos( 6.28318*(c*t+d) );
}

float iBox( in vec3 ro, in vec3 rd, in vec2 distBound, inout vec3 normal, in vec3 boxSize, out bool inside, out bool hit, out vec2 tfn) {
    vec3 m = sign(rd)/max(abs(rd), 1e-8);
    vec3 n = m*ro;
    vec3 k = abs(m)*boxSize;

    vec3 t1 = -n - k;
    vec3 t2 = -n + k;

	float tN = max( max( t1.x, t1.y ), t1.z );
	float tF = min( min( t2.x, t2.y ), t2.z );
    tfn = vec2(tN, tF);

    hit = true;

    if (tN > tF || tF <= 0.) {
        hit = false;
        return 0.;
    } else {
        if (tN >= distBound.x && tN <= distBound.y) {
        	normal = -sign(rd)*step(t1.yzx,t1.xyz)*step(t1.zxy,t1.xyz);
            inside = false;
            return tN;
        } else if (tF >= distBound.x && tF <= distBound.y) {
        	normal = -sign(rd)*step(t1.yzx,t1.xyz)*step(t1.zxy,t1.xyz);
            inside = true;
            return tF; // this means inside
        } else {
            hit = false;
            return 0.;
        }
    }
}


float sphere(vec3 eye, vec3 dir, float rad, out bool inside, out bool hit, out vec2 tfn){
    float a = dot(dir, dir);
    float b = 2.*dot(eye,dir);
    float c = dot(eye,eye)-rad*rad;
    float d = b*b-4.*a*c;

    if (d < 0.0){
        hit = false;
    }else{
        hit = true;
    }

    tfn.x = (-b-sqrt(d))/(2.*a);
    tfn.y = (-b+sqrt(d))/(2.*a);

    if (tfn.x < 0.){
        inside = true;
        return tfn.y;
    }else{
        inside = false;
        return tfn.x;
    }
}


vec3 rotateCamera(float len, vec2 m)
{
    float phi = m.x * PI * 2.0;
    float psi = m.y * PI;
    return len * vec3(cos(phi)*sin(psi), cos(psi), sin(phi)*sin(psi));
}


float noise3d(in vec3 x) {
    return textureLod(iChannel3, x*0.01, -100.).x*3.-1.0;

    // x *= 0.3;
    // vec3 p = floor(x), f = fract(x);
	// f *= f*(3.-f-f);
	// vec2 uv = (p.xy+vec2(37.,17.)*p.z) + f.xy,
    // rg = textureLod( iChannel0, (uv+.5)/256., -100.).yx;
	// // return mix(rg.x, rg.y, f.z);
    // return mix(rg.x, rg.y, f.z)*3.-1.;
}




float fbm(vec3 p){
    float steps = 7.0;
    float fac = pow(2., steps);
    p *= fac * 1.46;

    float sm = 0.0;
    float f = 1.0/fac;
    float a = 0.5;
    for (int i=0; i<int(steps); ++i){
        sm += noise3d(p * f) * a;

        /*p = mat3(0.00, 1.60, 1.20,
               -1.60, 0.72,-0.96,
               -1.20,-0.96, 1.28
            ) * p;*/
        f *= 2.;
        a *= 0.5;
    }
    return sm;
    /*return noise3d(p*.06125)*.5 +
          noise3d(p*.125)*.25 +
          noise3d(p*.25)*.125 +
          noise3d(p*.5)*.06125;*/
}


float mapVolume(vec3 p, out float density) {
    float rad = pow(p.y/4., 2.);
    float shape;// = length(p)-1.;//length(p.xz)-rad;//max(abs(p.y)-12.0, max(length(p.xz)-rad, -length(p.xz)+(rad-0.1) ));

    // p = mix(p*0.5, p, min(length(p)/4., 1.));
    p = mix(p*max(length(p), 2.)*1., p, min(length(p)/2.5, 1.));

    float tex = texture(iChannel2, p.xz*0.05).x;
    density = fbm(p)*2.-1.;
    density *= tex;
    //density = fbm(p*10.);
    //shape = p.y - density*3.;
    shape = density*3.;
    return abs(shape)-1.;
}




void mainImage( out vec4 O, in vec2 C )
{
#ifdef MARGIN
    if (abs(C.y-R.y/2.) >= min(R.x, R.y)/margin){ O=vec4(0); return; }
#endif

    // blue noise jittering
    vec2 noiseSize = vec2(textureSize(iChannel1, 0).xy);
    ivec2 repCoord = ivec2(fract(C/noiseSize) * noiseSize);
    float tang = mod(float(iFrame), 3.142*2.);
    vec2 repOffset = vec2(cos(tang), sin(tang)) * 10.;

    vec4 jit4 = texelFetch(iChannel1,
        ivec2(fract( (vec2(repCoord)+repOffset) /noiseSize) * noiseSize),
    0).xyzw;

    float jit = (jit4.x+jit4.y+jit4.z+jit4.w)/4.;
    jit = jit*2.-1.;
    jit *= 0.2;


    vec2 uv = (C-R/2.)/min(R.x,R.y);
    // vec3 eye = rotateCamera(40.0, iMouse.xy/R.xy);
    vec3 eye = rotateCamera(40.0, vec2(0.1, 0.001));

    vec3 f = normalize(vec3(0) - eye),
    s = normalize(cross(f, vec3(0,1,0))),
    dir = (
        mat4(vec4(s,0), vec4(cross(s, f),0), vec4(-f,0), vec4(1)) *
        vec4(normalize(vec3(uv, -2.4)), 0)
    ).xyz;



    vec3 radius = vec3(12.);
    int steps = 64;
    float startdist = 0.0;

    vec3 normal;
    bool inside;
    vec2 tfn;
    bool hit;
    //float dp = iBox(eye, dir, vec2(0.0001, 10000.), normal, radius, inside, hit, tfn);
    float dp = sphere(eye, dir, radius.x, inside, hit, tfn);

    vec4 acc;

    if (hit){
        acc.a = abs(tfn.x-tfn.y)*0.01;
    }else{
        O = vec4(0);
        return;
    }

    vec3 sp;
    if (inside){
        sp = eye;
    }else{
        sp = eye + dir * dp;
    }


    float density;
    vec3 cp = sp;
    float lradius = length(radius);

    for (int i=0; i<steps; ++i){
        //if (acc.a >= 1.0)break;

        //vec3 q = abs(cp) - radius;
        //float nd = max(q.x,max(q.y,q.z));
        float nd = length(cp) - radius.x;
        if(nd < 0.0001)
        {
            float dist = 1.0-mapVolume(cp/2.5, density)*2.5;
            if (distance(cp,sp) > startdist)
            {
                float rdensity = remap(saturate(density), 0., 0.2, 0., 1.);
                float tacc = max(dist, 0.1)/float(steps);

                vec4 color;
                color.xyz = hsv_to_rgb(vec3(
                    rdensity*0.5 - 0.1,
                    (1.0-rdensity)*1.,
                    rdensity*5. + smoothstep(0.3, 0.1, abs(rdensity-0.5))*10.
                ));

                // color.xyz = pal( rdensity*2. + 0.6, vec3(0.5,0.5,0.5),vec3(0.5,0.5,0.5),vec3(1.0,0.7,0.4),vec3(0.0,0.15,0.20) );

                color.a = 1.0;
                acc += color * tacc * (min(easeInExpo(1.0-rdensity*2.,2.)*10., 1.) + 0.15);
            }
            cp += dir * ((lradius*3.0)/float(steps) + jit);
        }
    }

    acc.xyz = max(acc.xyz * min(acc.a, 1.), 0.);
    acc.xyz = ACESFilm(acc.xyz);

    // Output to screen
    O = vec4(acc.xyz,1.0);
}
