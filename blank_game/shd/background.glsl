precision mediump float;

varying vec2 vTextureCoord; //The coordinates of the current pixel
uniform sampler2D backgroundTex; //The image data

uniform vec2 iResolution;
uniform float iTime;
uniform vec2 backgroundSize;

uniform vec2 camPos;


#define saturate(x) clamp(x,0.0,1.0)
#define MOD3 vec3(.1031,.11369,.13787)




vec3 hash33(vec3 p3){
	p3 = fract(p3 * MOD3);
    p3 += dot(p3, p3.yxz+19.19);
    return -1.0 + 2.0 * fract(vec3((p3.x + p3.y)*p3.z, (p3.x+p3.z)*p3.y, (p3.y+p3.z)*p3.x));
}
float perlin_noise(vec3 p){
    vec3 pi = floor(p);
    vec3 pf = p - pi;

    vec3 w = pf * pf * (3.0 - 2.0 * pf);

    return 	mix(
        		mix(
                	mix(dot(pf - vec3(0, 0, 0), hash33(pi + vec3(0, 0, 0))),
                        dot(pf - vec3(1, 0, 0), hash33(pi + vec3(1, 0, 0))),
                       	w.x),
                	mix(dot(pf - vec3(0, 0, 1), hash33(pi + vec3(0, 0, 1))),
                        dot(pf - vec3(1, 0, 1), hash33(pi + vec3(1, 0, 1))),
                       	w.x),
                	w.z),
        		mix(
                    mix(dot(pf - vec3(0, 1, 0), hash33(pi + vec3(0, 1, 0))),
                        dot(pf - vec3(1, 1, 0), hash33(pi + vec3(1, 1, 0))),
                       	w.x),
                   	mix(dot(pf - vec3(0, 1, 1), hash33(pi + vec3(0, 1, 1))),
                        dot(pf - vec3(1, 1, 1), hash33(pi + vec3(1, 1, 1))),
                       	w.x),
                	w.z),
    			w.y);
}


float hash21(vec2 p){
 	p = fract( p*vec2(123.34, 456.21) );
    p += dot(p, p+45.32);
    return fract(p.x*p.y);
}


float star(vec2 p, float time){
	float d = length(p);
    float m = (max(0.2, abs(sin(time))) * 0.02) / d;

    m *= smoothstep(1.0, 0.2, d);
    return m;
}


float starField(vec2 uv, float time){
    float val = 0.;

    vec2 gv = fract(uv) - 0.5;
    vec2 id = floor(uv);

    for (int x=-1; x<=1; x++){
        for (int y=-1; y<=1; y++)
        {
            vec2 offset = vec2(x, y);

            float n = hash21(id + offset);
            float star = star(gv - offset - (vec2(n, fract(n*100.0)) - 0.5), time*10.*fract(n*135.246));
            float size = min(1.0, fract(n*1234.567) + 0.1);

            val += star * size;
        }
    }

    return val;
}


vec3 makeStars(vec3 uvw){
    float stars = starField( uvw.xy*50.0, iTime );
    float clouds = max(perlin_noise(uvw*1.25)*0.7+0.3, 0.0);

    vec3 cloudsCol = cos((uvw*2.0)+vec3(0,2,4)) + 1.0;
    stars *= clouds+0.5;
    cloudsCol *= clouds;

    return saturate(cloudsCol+pow(stars,2.0)*2.0 + vec3(0.075,0.094,0.384)*0.5);
}




vec3 mix4(vec3 a, vec3 b, vec3 c, vec3 d, vec3 e, float t){
    vec3 col = a;
    col = mix(col, b, smoothstep(0., 1./3., t));
    col = mix(col, c, smoothstep(0., 2./3., t));
    col = mix(col, d, smoothstep(0., 3./3., t));
    col = mix(col, e, smoothstep(0., 4./3., t));
    return col;
}




float easeInExpo(float x) {
	return x==0.0 ? 0.0 : pow(2.0, 10.0*x - 10.0);
}
float easeOutExpo(float x) {
	return x==1.0 ? 1.0 : 1.0 - pow(2.0, -10.0 * x);
}




//https://www.color-hex.com/color-palette/40131
//https://www.color-hex.com/color-palette/1019746
const vec3 col0 = vec3(0.918,0.984,1.000);
const vec3 col1 = vec3(0.933,0.686,0.380);
const vec3 col2 = vec3(0.933,0.365,0.424);
const vec3 col3 = vec3(0.416,0.051,0.514);


void main(void)
{
	vec2 inCamPos = vec2(camPos.x, 1.0 - camPos.y);
	vec2 fcoord = gl_FragCoord.xy + inCamPos/10.0;


	float fac = 1.0;
    vec2 uv = fcoord/min(iResolution.x,iResolution.y) * fac;
    vec2 uvTex = fcoord/backgroundSize.xy * fac * 0.75;

	vec2 texsamp = texture2D(backgroundTex, vec2(mod(uvTex.x, 1.0), clamp(1.0 - uvTex.y, 0.01, 0.97))).xw;
	vec3 bg = texsamp.x*mix(col1,col0,uvTex.y) + col0*0.75*(1.0-texsamp.x);
	bg = saturate(pow(bg, vec3(2.2)));
	bg = mix(mix(col0,col1,saturate(uvTex.y-1.0)), bg, texsamp.y);
    vec3 stars = makeStars(vec3(uv, iTime*0.2));

    vec3 color = mix4(bg, col1, col2, col3, stars, uvTex.y-2.0);



	// Output to screen
	gl_FragColor = vec4(color, 1.0);
}
