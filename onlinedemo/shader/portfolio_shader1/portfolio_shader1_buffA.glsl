float cammove = 0.0;


float sunflare(vec2 uv){
    float ang = atan(uv.y, uv.x);
	float d = length(uv);
    d = pow(d, 0.1);
	float f = 1.2/(length(uv)*25.0+1.2);
	f = pow(f, 2.0);
	f = f+f*(sin((ang+1.0/18.0)*12.0)*.1+d*.1+.8);
    return f;
}
float anflare(vec2 uv, float intensity, float stretch, float brightness){
    uv.x *= 1.0/(intensity*stretch);
    uv.y *= 0.5;
    return smoothstep(0.009, 0.0, length(uv))*brightness;
}


vec2 space(vec3 p){
    // terrain
    float h = sin(p.x*0.05+cos(p.z*0.05))*10.;
    vec2 np = p.xz;
    float detail = mix(1.0, 4.0, step(0.6, length(p.xz-focusPoint.xz)/MAX_DIST));
    for (float i=0., a=1.; i<groundIter; i++){
    #ifdef ROCK_SLIME
        np.xy -= (iTime*0.3*i/3.) * vec2(1, mod(i,2.)*2.-1.);
    #endif
        float re = textureLod(iChannel0, (np + iTime*0.25)*0.0015, groundLOD+detail).r;
        h += (re*2.-1.)*a*(h*0.4);
        np = mat2(0.8,-0.6,0.6,0.8) * np * 4.;
        a *= 0.325;
    }
    float d = (p.y+10.+h);
    float mat = 0.0;

    p -= focusPoint;
    p.xy *= mat2(0.866025, -0.500001, 0.500001, 0.866025);//rotate(30.);
    p.xz *= mat2(0.984808, 0.173648, -0.173648, 0.984808);//rotate(-10.);
    float bump = dot2(textureLod(iChannel0, p.xy*0.1, cutLOD).rgb);

    // gem
    vec3 cp = p;
    cp.xy *= mat2(0.766044, 0.642788, -0.642788, 0.766044);//rotate(-40.);
    float cd = (sdOctahedron(cp-vec3(0,-0.2,0), 0.5)-0.1)/0.3;
    cd -= bump*0.5;
    d = min(d, cd);
    if (d == cd){ mat = 1.0; }

    // cave thing
    vec3 q = abs(p)-4.5;
    float qr = max(q.x,max(q.y,q.z));
    qr = max(qr, -length(p-vec3(1.0,0,1.2))+7.15);
    qr -= bump*0.075;
    d = smin(d, qr*1.5, 2.5);

    return vec2(d*0.3, mat);
}


float planet(vec3 eye, vec3 dir){
    float rad = PLANET_RADIUS;
    float a = dot(dir, dir);
    float b = 2.*dot(eye,dir);
    float c = dot(eye,eye)-rad*rad;
    float d = b*b-4.*a*c;
    if(d<0.)return -1.;
    return (-b-sqrt(d))/(2.*a);
}


vec3 screenray(vec3 eye, vec3 dir, float maxd){
    float d=0., i=0.; vec2 ind;
    for (; i<64. && d<maxd; ++i){
        ind = space(eye + dir * d);
        if (ind.x < 0.001 * d)break;
        d += ind.x * (d/maxd+1.);// *1.1+0.9);
    }
    return vec3(d, i/64., ind.y);
}

float shadowray(vec3 eye, vec3 dir, float maxd) {
    float d=0.2, i=0., r=1., ph=2e10;
    for(; i<64. && d<maxd; ++i){
     	vec3 p = eye + dir * d;
        float ind = space(p).x;
        if (ind < 0.0)return 0.;

        float y = ind*ind/ph,
        nd = sqrt(ind*ind-y*y);
        r = min( r, 10.0*nd/max(0.0,d-y) );
        d += ind * (d/maxd+1.);
    }

    return r;
}


vec3 normal(vec3 P){
    vec3 ep = vec3(-4, 4, 0) * 0.001;
    return normalize(
        space(P+ep.xyy).x * ep.xyy +
        space(P+ep.yxy).x * ep.yxy +
        space(P+ep.yyx).x * ep.yyx +
        space(P+ep.xxx).x * ep.xxx
    );
}


float shade(vec3 eye, float dist, float md, vec3 P, vec3 N){
    float shading = max(dot(N, light)*0.5+0.25, 0.);
    shading = mix(min(1.0,shading*2.0), shading, dot(normalize(eye), N));
    if (shading >= 0.0){ shading *= shadowray(P, light, md/2.)+0.1; }
    return saturate( (shading+0.1)+(dist/md)*0.1 );
}

float shade_planet(vec3 eye, float dist, vec3 P, vec3 N){
    float shading = max(dot(N, light)*0.5+0.25, 0.);
    return mix(min(1.0,shading*3.0), shading, dot(normalize(eye), N));
}


vec4 makePixel(vec2 C){
    vec3 col = vec3(0);
    vec2 uv = (C-R*0.5)/R.y;
    cammove = get_cam_movement(iTime);

    vec3 eye = vec3(0,-1.5,10);
    vec3 lookAt = vec3(3,-3., 0);

    vec2 ms = iMouse.xy/R;
    ms = 1.0-ms;
    ms = vec2(ms.x-0.5, ms.y);
    eye += vec3(sin(ms.x), cos(ms.x)*sin(ms.y), sin(ms.y))*3.;

    eye = mix(eye+focusPoint+vec3(2,-1.1,0), eye, cammove);
    lookAt = mix(focusPoint+vec3(1.5,-0.5,0), lookAt, cammove);

    vec3 f = normalize(lookAt - eye),
    s = normalize(cross(f, vec3(0,1,0))),
    dir = (
        mat4(vec4(s,0), vec4(cross(s, f),0), vec4(-f,0), vec4(1)) *
        vec4(normalize(vec3(uv, -mix(2.5, 0.9, cammove) )), 0)
    ).xyz;

    float rot = -(1.-cammove)*MAX_CAM_ANGLE;
    dir.xy *= rotate(rot);

    vec3 gdir = dir;
    gdir.y += sin(uv.x*2.0+1.3)*0.1*cammove;
    float dof = MAX_DIST;

#ifdef PULSE
    float pulse = 1.+0.75*smoothstep(0.8, 1.1, sin(iTime)*0.5+0.5);
#else
    float pulse = 0.0;
#endif

    for (int i=0; i<2; ++i){
        float maxd = MAX_DIST/float(i+1);
        vec3 dist = screenray(eye, gdir, maxd);
        if (dist.x >= maxd){
            float pd = planet(eye-vec3(-120.,-2,-1000.), dir);
            if (pd > -1.){
                eye.z += 900.;
                vec3 P = eye + dir * pd;
                vec3 N = normalize(P);
                vec3 np = P;
                np.yz *= rotate(-iTime*0.75);
                N = normalize(N + (textureLod(iChannel1, np.yz*0.01, 1.).rgb));

                float sh = shade_planet(eye, pd, P, N)*2.0-1.;
                col = mix(col, vec3(1.0), max(sh, -0.1));
            }
            break;
        }

        vec3 P = eye + gdir * dist.x;
        vec3 N = normal(P);

        vec3 dofp = P-focusPoint;
        dof = length(dofp.xz * vec2(.4,1).xy);

        if (dist.z == 1.0){
            eye = P;
            gdir = normalize(reflect(gdir, N));
            col -= 1.0-vec3(0.9,0.05,0.2)*pulse;
            continue;
        }

        vec3 sh = vec3(shade(eye, dist.x, maxd, P, N));
        sh -= (1.0-vec3(pulse,0,0.4)) * (0.5/max(length(P-focusPoint), 0.));
        sh = max(sh, 0.);
        col += mix(sh*0.5, sh, saturate(1.0-pow(dist.y,3.0)*3.0));
        break;
    }


#ifdef SHOW_LENS_FLARE
    vec3 sdir = dir;
    sdir.xz *= mat2(0.927184, 0.374607, -0.374607, 0.927184); //rotate(-22.);
    sdir.yz *= mat2(0.991445, 0.130526, -0.130526, 0.991445); //rotate(-7.5);
    sdir.xy *= rotate(-rot);

    col += sqrt(sunflare(sdir.xy*1.1));
    float an = pow(anflare(sdir.xy, 600.0, 0.6, 0.63), 3.9);
    an += smoothstep(0.0025, 1.0, an)*10.0;
    an *= smoothstep(0.0, 1.0, an);
    col += an;
    col = saturate(col);
#else
    col = sqrt(saturate(col));
#endif

    return vec4(col, dof/MAX_DIST);
}



void mainImage( out vec4 O, in vec2 C )
{
#ifdef MARGIN
    if (abs(C.y-R.y/2.) >= mR/margin.y){ O=vec4(0); return; }
#endif

    O = makePixel(C);
}
