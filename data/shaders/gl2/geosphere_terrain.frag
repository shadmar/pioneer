uniform vec4 atmosColor;
// to keep distances sane we do a nearer, smaller scam. this is how many times
// smaller the geosphere has been made
uniform float geosphereScale;
uniform float geosphereScaledRadius;
uniform float geosphereAtmosTopRad;
uniform vec3 geosphereCenter;
uniform float geosphereAtmosFogDensity;
uniform float geosphereAtmosInvScaleHeight;

uniform Scene scene;

varying vec3 varyingEyepos;
varying vec3 varyingNormal;
varying vec4 vertexColor;
varying vec4 varyingemission;

void main(void)
{
	vec3 eyepos = varyingEyepos;
	vec3 eyenorm = normalize(eyepos);
	vec3 tnorm = normalize(varyingNormal);
	vec4 diff = vec4(0.0);
	vec4 rdiff = vec4(0.0);
	vec4 emission = gl_FrontMaterial.emission+varyingemission;
	vec4 vc=vertexColor;
	//vec4 specular = vec4(0.0);
	//
	
	


#if (NUM_LIGHTS > 0)

	float specularReflection=0.0;
	float attenuation;

	for (int i=0; i<NUM_LIGHTS; ++i) {
		float nDotVP = max(0.0, dot(tnorm, normalize(vec3(gl_LightSource[i].position))));
		float nnDotVP = max(0.0, dot(tnorm, normalize(-vec3(gl_LightSource[i].position))));
		//diff+=gl_LightSource[i].diffuse * (nDotVP);
		diff += gl_LightSource[i].diffuse * (nDotVP+0.1*clamp(gl_LightSource[i].diffuse-nnDotVP*4.0,0.0,1.0)*(1.0/float(NUM_LIGHTS))	);

		//	diff +=  2.0 * gl_LightSource[i].diffuse - min(			
		//		      max(0.0, dot(tnorm, normalize(vec3(gl_LightSource[i].position))))		//darken backside
		 //	              + dot(tnorm, normalize(-vec3(gl_LightSource[i].position))) 			//
		//		      + max(0.0, dot(tnorm, normalize(-vec3(gl_LightSource[i].position)))),0.75);
			//diff *= 1.0/float(NUM_LIGHTS);
		  	


	  /*  vec3 lightDirection = normalize(vec3(gl_LightSource[i].position));

	    attenuation = max(0.0,dot(tnorm,lightDirection));
	    
	    if (dot(tnorm, -lightDirection) < 0.0) 
            // light source on the wrong side?
            {
               specularReflection = vec3(0.0, 0.0, 0.0); 
                  // no specular reflection
            }
            else // light source on the right side
            {
               specularReflection = pow(attenuation,32.0) * vec3(gl_LightSource[i].diffuse) * vertexColor.xyz * (pow(max(0.0, dot(reflect(-lightDirection,eyenorm), eyepos)),0.32));
            }*/

		vec3 L = normalize(gl_LightSource[i].position.xyz - eyepos); 
		vec3 E = normalize(-eyepos); // we are in Eye Coordinates, so EyePos is (0,0,0)
		vec3 R = normalize(-reflect(L,tnorm)); 
	    	if (vertexColor.b > 0.05 && vertexColor.r < 0.05) {
			specularReflection += pow(max(dot(R,E),0.0),0.3*32.0)*0.25*(1.0/float(NUM_LIGHTS));
		//	vc.b-=5.0;
		}

	

	//	specular = gl_LightSource[i].diffuse * pow(nDotVP,32.0);
	}
	

#ifdef TERRAIN_WITH_LAVAasd
	//Glow lava terrains
	if (vertexColor.r > 0.5000 && vertexColor.g < 0.2000 && vertexColor.b < 0.0100) {
		emission+=1.25*vertexColor;//*(clamp(0.5-diff.r,0.0,1.0));
	}
#endif



#ifdef ATMOSPHERE
	// when does the eye ray intersect atmosphere
	float atmosStart = findSphereEyeRayEntryDistance(geosphereCenter, eyepos, geosphereScaledRadius * geosphereAtmosTopRad);

	float fogFactor;
	{
		float atmosDist = geosphereScale * (length(eyepos) - atmosStart);
		float ldprod;
		// a&b scaled so length of 1.0 means planet surface.
		vec3 a = (atmosStart * eyenorm - geosphereCenter) / geosphereScaledRadius;
		vec3 b = (eyepos - geosphereCenter) / geosphereScaledRadius;
		ldprod = AtmosLengthDensityProduct(a, b, atmosColor.w*geosphereAtmosFogDensity, atmosDist, geosphereAtmosInvScaleHeight);
		fogFactor = clamp(1.5 / exp(ldprod),0.0,1.0);
	}

	vec4 atmosDiffuse = vec4(0.0);
	{
		vec3 surfaceNorm = normalize(atmosStart*eyenorm - geosphereCenter);
		for (int i=0; i<NUM_LIGHTS; ++i) {

			vec4 nDotVP = gl_LightSource[i].diffuse * max(0.0, dot(surfaceNorm, normalize(vec3(gl_LightSource[i].position))));
			vec4 nnDotVP = gl_LightSource[i].diffuse * max(0.0, dot(surfaceNorm, normalize(-vec3(gl_LightSource[i].position))));
		
			atmosDiffuse += 0.5*gl_LightSource[i].diffuse * (nDotVP+0.1*clamp(gl_LightSource[i].diffuse-nnDotVP*4.0,0.0,1.0)*(1.0/float(NUM_LIGHTS))	);
			//atmosDiffuse = vec4(0);
		}
	}
	atmosDiffuse.a = 1.0;

	gl_FragColor =
		emission +
		fogFactor *
		((0.25*scene.ambient * vc) +
		(diff * vc)) +
		(1.0-fogFactor)*(atmosDiffuse*atmosColor)
			+pow((1.0-fogFactor),512.0)*atmosColor*0.5*diff
				+diff*specularReflection;
#else // atmosphere-less planetoids and dim stars
	gl_FragColor =
		emission +
		(0.25*scene.ambient * vertexColor) +
		(diff * vertexColor);
#endif //ATMOSPHERE

#else // NUM_LIGHTS > 0 -- unlit rendering - stars
	//emission is used to boost colour of stars, which is a bit odd
	gl_FragColor = emission + vertexColor;
#endif
	SetFragDepth();
}
