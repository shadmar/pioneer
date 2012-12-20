uniform vec4 atmosColor;
// to keep distances sane we do a nearer, smaller scam. this is how many times
// smaller the geosphere has been made
uniform float geosphereScale;
uniform float geosphereScaledRadius;
uniform float geosphereAtmosTopRad;
uniform vec3 geosphereCenter;
uniform float geosphereAtmosFogDensity;
uniform float geosphereAtmosInvScaleHeight;

varying vec4 varyingEyepos;
varying vec3 varyingNormal;

void sphereEntryExitDist(out float near, out float far, in vec3 sphereCenter, in vec3 eyeTo, in float radius)
{
	vec3 v = -sphereCenter;
	vec3 dir = normalize(eyeTo);
	float b = -dot(v, dir);
	float det = (b * b) - dot(v, v) + (radius * radius);
	near = 0.0;
	far = 0.0;
	if (det > 0.0) {
		det = sqrt(det);
		float i1 = b - det;
		float i2 = b + det;
		if (i2 > 0.0) {
			near = max(i1, 0.0);
			far = i2;
		}
	}
}

void main(void)
{



float specularReflection=0.0;


	float skyNear, skyFar;
	vec3 eyepos = vec3(varyingEyepos);
	vec3 eyenorm = normalize(eyepos);
	sphereEntryExitDist(skyNear, skyFar, geosphereCenter, eyepos, geosphereScaledRadius * geosphereAtmosTopRad);
	float atmosDist = geosphereScale * (skyFar - skyNear);
	float ldprod;
	{
		vec3 dir = eyenorm;
		// a&b scaled so length of 1.0 means planet surface.
		vec3 a = (skyNear * dir - geosphereCenter) / geosphereScaledRadius;
		vec3 b = (skyFar*2.0 * dir - geosphereCenter) / geosphereScaledRadius;
		ldprod = AtmosLengthDensityProduct(a, b, atmosColor.a * geosphereAtmosFogDensity, atmosDist, geosphereAtmosInvScaleHeight);
	}
	float fogFactor = 1.0 / exp(ldprod);
	vec4 atmosDiffuse = vec4(0.0);
	vec4 ssDiffuse = vec4(0.0);
	{
		vec3 surfaceNorm = normalize(skyNear * eyenorm - geosphereCenter);
		for (int i=0; i<NUM_LIGHTS; ++i) {

			
		
		vec3 L = normalize(gl_LightSource[i].position.xyz - eyepos); 
		vec3 E = normalize(-eyepos); // we are in Eye Coordinates, so EyePos is (0,0,0)
		vec3 R = normalize(-reflect(L,varyingNormal)); 
		specularReflection += pow(max(dot(R,E),0.0),0.3*32.0)*(1.0/float(NUM_LIGHTS));

			vec4 nDotVP = gl_LightSource[i].diffuse * max(0.0, dot(surfaceNorm, normalize(vec3(gl_LightSource[i].position))));
			vec4 nnDotVP = gl_LightSource[i].diffuse * max(0.0, dot(surfaceNorm, normalize(-vec3(gl_LightSource[i].position))));

			atmosDiffuse +=   0.7*gl_LightSource[i].diffuse * (nDotVP+0.5*clamp(gl_LightSource[i].diffuse-nnDotVP*4.0,0.0,1.0)*(1.0/float(NUM_LIGHTS))	);
			//atmosDiffuse +=   gl_LightSource[i].diffuse * (nDotVP)*(1.0/float(NUM_LIGHTS))	;
		}
	}
	atmosDiffuse.a = 1.0;

	vec4 sunset = vec4(1.0+clamp(1.0-2.0*atmosDiffuse.r,0.0,1.0),clamp(pow(atmosDiffuse.g,0.85),0.0,1.0)+0.1,clamp(pow(atmosDiffuse.b,0.85),0.0,1.0),1.0);

	gl_FragColor = (1.0-fogFactor) * (atmosDiffuse*vec4(atmosColor.rgb, 1.0))   	*sunset
			//+atmosColor*pow((1.0-fogFactor),1.0)*2.0*atmosDiffuse	
			+atmosColor*specularReflection*(1.0-fogFactor)			*sunset;

//	gl_FragColor = sunset*(1.0-fogFactor);

	SetFragDepth();
}
