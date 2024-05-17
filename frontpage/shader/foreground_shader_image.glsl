uniform vec3 backgroundColor;

in vec2 Coord;
in vec2 Size;
flat in float Time;
flat in float GridMult;
flat in int Type;

#define R (iResolution.xy)
#define mR min(R.x, R.y)
#define saturate(x) clamp(x, 0.0, 1.0)

float minr = 0.0;
float maxr = 0.0;

float max2(vec2 p){ return max(p.x, p.y); }

vec3 hue_to_rgb(float hue)
{
    float r = abs(hue * 6.0 - 3.0) - 1.0;
    float g = 2.0 - abs(hue * 6.0 - 2.0);
    float b = 2.0 - abs(hue * 6.0 - 4.0);
    return saturate(vec3(r,g,b));
}

vec3 pal( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )
{
    return a + b*cos( 6.28318*(c*t+d) );
}


float get_type_dist(vec2 uv, vec2 fac, float time){
    switch (Type){
        case 0: return length(uv) - mix(-fac.x, fac.x*3., time);
        case 1: return abs(uv.x) - mix(-fac.x, fac.x*2., time);
        case 2: return abs(uv.y) - mix(-fac.x, fac.x*2., time);
        case 3: return abs(uv.x+uv.y)/2. - mix(-fac.x, fac.x, time)*2.;
        case 4: return (1.-uv.x+uv.y)/2. - mix(-fac.x, fac.x*1.5, time)*2.;
        case 5: return (1.-(1.-uv.x+uv.y))/2. - mix(-fac.x, fac.x*1.5, time)*2.;
        case 6: return uv.x - mix(-fac.x, fac.x*2., time)*2.;
        case 7: return uv.y - mix(-fac.x, fac.x*2., time)*2.;
    }
    return 0.0;
}


void mainImage( out vec4 O, in vec2 C )
{
    if (Time >= 1.0)discard;
    if (Time <= 0.0){
        O = vec4(backgroundColor,1);
        return;
    }

    // const float grid = 1.;
    // float mr = min(Size.x, Size.y);
    // vec2 gCoord = floor(Coord/grid)*grid;
    // vec2 uv = Coord/mr;
    // vec2 guv = gCoord/mr;

    minr = min(Size.x, Size.y);
    maxr = max(Size.x, Size.y);

    float grid = 32. * GridMult;
    vec2 uv = Coord/maxr;
    vec2 guv = floor(uv*grid)/grid;

    vec4 noise_sample = texture(iChannel0, guv).xyzw;//*2.-1.;
    float noise = noise_sample[(iFrame/4) % 4];

    vec2 fac = vec2(1.0, 0.75);
    // float rad = mix(-fac.x, fac.x*2., 0.5);//mix(-(fac.x+fac.y+maxr/minr), fac.x+fac.y+maxr/minr, 0.5);
    float alpha = get_type_dist(guv, fac, Time);
    alpha = smoothstep(-fac.x + noise*fac.y, fac.x, alpha);

    vec4 color = vec4(backgroundColor,1);
    // vec3 trancol = mix(hue_to_rgb(alpha*1. + noise*0.1), vec3(0.490, 0.992, 0.996)*1.8, alpha) * alpha;
    vec3 trancol = mix(hue_to_rgb(0.8 + noise*alpha*0.15), vec3(1, 0.996, 0.867), alpha);
    trancol = mix(trancol*alpha, color.xyz, smoothstep(0.95,1.0,alpha));
    O = vec4(trancol, smoothstep(0.0, 0.6, alpha));
}
