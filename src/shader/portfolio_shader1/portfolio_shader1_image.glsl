// Made by: TheNosiriN

// Dave_Hoskins Hash: https://www.shadertoy.com/view/4djSRW
float hash13(vec3 p3){
	p3  = fract(p3 * .1031);
    p3 += dot(p3, p3.zyx + 31.32);
    return fract((p3.x + p3.y) * p3.z);
}
//


void mainImage( out vec4 O, in vec2 C )
{
    #ifdef MARGIN
    if (abs(C.y-R.y/2.) >= mR/margin.y){ O=vec4(0); return; }
    #endif

    vec2 uv = C/R;
    vec3 col = vec3(0);

    #ifdef DOF
    // Xor's Bokeh: https://www.shadertoy.com/view/fldfWH
    float focus = 3.*pow(1.-get_cam_movement(iTime), 2.0);
    for(vec2 i = vec2(0,11); i.x<16.; i++){
        col += pow(
            texture(iChannel0,(C+R.y*focus*sin(i)/6e2*sqrt(i).x)/R).xyz,
        5.+col-col);
    }//
    col = pow(col/16.,.2+col-col);
    vec4 tex = texelFetch(iChannel0, ivec2(C), 0);
    col = mix(tex.xyz, col, smoothstep(0.075, 0.1, tex.w));
    #else
    col = texelFetch(iChannel0, ivec2(C), 0).xyz;
    #endif

    col = max(col - hash13(vec3(C, float(iFrame)))*0.05, 0.); //film grain
    col *= 0.3 + 0.8*pow(32.0*uv.x*uv.y*(1.0-uv.x)*(1.0-uv.y),0.2); //vignette
    col *= smoothstep(0.0, 7.0, iTime*0.75); //fade in

    O = vec4(col, 1);
}
