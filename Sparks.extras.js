				var SPARKSx = {};
				
		/* Initializers ************************************************************/		
		
		/*ERROR scale cannot be set before partilce.target
		SPARKSx.setSize = function(max_size,min_size)
		{
			this.max_size = max_size;
			this.min_size = min_size;
			
			this.initialize = function( emitter, particle )
			{
				if (this.min_size === undefined)
					particle.tareget.scale.x = particle.tareget.scale.y = this.max_size;
				else
					particle.tareget.scale.x = particle.tareget.scale.y = this.max_size + Math.random()*(this.max_size-this.min_size)
			}
			
		}
		
		*/
		//SPARKSx.setSize.prototype.constructor =SPARKSx.setSize;
		

				
		/* Actions *******************************************************************/		
				/*
				start_color = THREE.Color set at the start of the particles life
				end_color = THREE.Color set at the end of the particles life
				*/
				
				SPARKSx.colorChange = function(start_color,end_color)
				{
				   
				this.start_color = start_color;	   
				this.end_color = end_color;	
					
				this.update = function(emitter, particle, time)
				{
					var ratio = particle.age / particle.lifetime;
					
					var inv_ratio = 1 - ratio;
					particle.target.material.color.r = (inv_ratio *this.start_color.r) + (ratio * this.end_color.r);
					particle.target.material.color.g = (inv_ratio *this.start_color.g) + (ratio * this.end_color.g);
					particle.target.material.color.b = (inv_ratio *this.start_color.b) + (ratio * this.end_color.b);
				}
			}
			/*
			
			The attractor exerts a force on a particle  of constant / distance between attractor and particle. If the constants are negative its acts as a repulsor
			position = the position of the attractor
			constant-  the multiplier
			inv_constant - if this is defined then a distance / inv_constant is added
			square - if this is set to true, distance is substituted with distance Squared, which is faster computationaly
			show_sphere - if true displays a blue Sphere for repulsors, and a green sphere for attractors
			*/
			
			SPARKSx.attractor = function (position,constant,inv_constant,square,show_sphere)
			{
				this.position = position;
				this.constant = constant;
				this.inv_constant = inv_constant;
				this.square = square;
				this.show_sphere = show_sphere;
				
				if (this.show_sphere === true)
				{
					if (this.constant > 0)
						var material = new THREE.MeshLambertMaterial( { color: 0x00ff00, wireframe: true } ); 
					else
						var material = new THREE.MeshLambertMaterial( { color: 0x0000ff, wireframe: true } ); 
				}
				

			 mesh = new THREE.Mesh( new THREE.SphereGeometry(
			  10 , 32, 12 ), material);
			 mesh.position = this.position;
			 scene.add(mesh);
				
				this.update = function(emitter, particle, time)
				{
					var d = new THREE.Vector3();
					d.copy(particle.position);
					d.subSelf(this.position);
					if (this.square === true)
						var l = d.lengthSq();
					else
						var l = d.length();
					d.normalize();
					k1 = this.constant/l;
					if (this.inv_constant != undefined)
						k2 = l / this.inv_constant;
					else
						k2 =0;
					
					d.multiplyScalar(-k1 -k2);
					particle.position.addSelf(d);
				}
			}
			
			/*
			used to change the size of a particle during its lifetime
			size_percent is the perctage growth increase or decrease
			start_scale - the initial scale
			end_scale - the final scale
			start_life - is between 0 and 1, from start to end of a particle lifetime
			*/ 
			SPARKSx.expandContract = function (start_scale,end_scale,start_life)
			{
				this.start_scale = start_scale;
				this.end_scale = end_scale;
				
				if ((start_life <0 )|| (start_life > 1))
					console.log('fadeOut: start is out of range (0 to 1)');
				if (start_life === undefined)
					this.start_life =0;
				else this.start_life = start_life;
				
				var _ratio; 
				

				
				
				this.update = function(emitter, particle, time)
				{
					//_ratio = 0 to 1
					var _ratio = (particle.age  / particle.lifetime);
					if (_ratio > this.start_life)
					{						
						_ratio -= this.start_life;
						_ratio =  (_ratio / (1 - this.start_life));
						/*
						if ( particle.target == instanceof THREE.Particle )
						{
							particle.target.scale.x= particle.target.scale.y = this.start_scale + _ratio *(this.end_scale-this.start_scale);
						}
						else */
							particle.target.scale( this.start_scale + _ratio *(this.end_scale-this.start_scale))
							
					}
					else 	
						//particle.target.scale.x= particle.target.scale.y = this.start_scale;
						particle.target.scale( this.start_scale + _ratio *(this.end_scale-this.start_scale))
				}
				
			}
			
			

			//Fades a particle to transparent
			//start is between 0 and 1, from start to end of lifetime
			SPARKSx.fadeOut = function (start)
			{
				if ((start <0 )|| (start > 1))
					console.log('fadeOut: start is out of range (0 to 1)');
				if (start === undefined)
					this.start =0;
				else this.start = start;
				
				var _ratio =0;//cached private variable;
				
				this.update = function(emitter, particle, time)
				{
					//ratio = 0 to 1
					 _ratio = (particle.age  / particle.lifetime);
					if (_ratio > this.start)
					{
						
						_ratio -= this.start;
						particle.target.material.opacity =  1 -(_ratio / (1 - this.start));
					}
					
				}
				
			}
				
			/* Uses Sin wave to pulsate the scale of a particle
			time_scale - used to change the frequencey of the sin wave
			sin_scale - use to amplify the sin wave
			constant - adds a constant to the sin wave
			*/
			SPARKSx.pulsator = function (time_scale,sin_scale,constant)
			{
				this.time_scale = time_scale;
				this.sin_scale = sin_scale;
				if (constant !== undefined)
					this.constant = constant
				else if (constant <= 1)
				{
					this.constant = 1.01;
					console.log('pulsator constant must be greater than 1, setting to 1.01');
				}
				else
					this.constant = 1.01;
				var _count =0;

				this.update = function(emitter, particle, time)
				{
					_count += time;
					var t =  _count*this.time_scale;
					var sinv = (Math.sin(t) + this.constant)* this.sin_scale;
					//particle.target.scale.x= particle.target.scale.y = sinv;
					particle.target.size(sinv);
				}
				
			}
			/*
			A cylinder with the cirlce lying in the XZ plane
			Position: the centre of the cylinder
			Height: the height of the cylinder , 0 will make a XZ planar circle
			Max_radius: the outer radius of the circle
			Min_radius: the inner radius of the circle, Optional parameter
			*/
			
			SPARKSx.CylinderZoneXY = function (position,height, min_radius,max_radius)
			{
				this.position = position;
				this.min_radius = min_radius;
				this.max_radius = max_radius;
				this.height = height;
				var _theta;
				var _r;
				
				this.getLocation = function()
				{
					var location = new THREE.Vector3(this.position.x,this.position.y,this.position.z);
					if (this.max_radius === undefined)
						_r = this.min_radius;
					else _r = this.min_radius + Math.random() *(this.max_radius-this.min_radius);
					_theta = Math.random()*Math.PI*2;
					location.x += _r * Math.cos(_theta);
					location.y += _r * Math.sin(_theta);
					location.z += Math.random()*this.height;
					return location;
				}
					
			}
			/*
			A cylinder with the cirlce lying in the XZ plane
			Position: the centre of the cylinder
			Height: the height of the cylinder , 0 will make a XZ planar circle
			Max_radius: the outer radius of the circle
			Min_radius: the inner radius of the circle, 0 will fill the circle, undefined will put all the points on the max_radius
			Optional parameter
			*/
			
			SPARKSx.CylinderZoneXZ = function (position,height, max_radius,min_radius)
			{
				this.position = position;
				this.min_radius = min_radius;
				this.max_radius = max_radius;
				this.height = height;
				var _theta;
				var _r;
				
				this.getLocation = function()
				{
					var location = new THREE.Vector3(this.position.x,this.position.y,this.position.z);
					if (this.max_radius === undefined)
						_r = this.min_radius;
					else _r = this.min_radius + Math.random() *(this.max_radius-this.min_radius);
					_theta = Math.random()*Math.PI*2;
					location.x += _r * Math.cos(_theta);
					location.y += Math.random()*this.height;
					location.z += _r * Math.sin(_theta);
					return location;
				}
					
			}

			/*
			Generates a hyper cube, where the empty space in the middle of the cube is defined my the minimum dimensions
			position 
			max_w = maximum width (x) 
			max_h = maximum height (y)
			max_d = maximum depth (z)
			min_w = minimum width 
			min_h = minimum height
			min_d = minimum depth
		
			Doesnt quite behave as Expected
			SPARKSx.HyperCubeZone = function(position, max_w,max_h,max_d,min_w,min_h,min_d) {
				this.position = position;
				this.max_w = max_w;
				this.max_h = max_h;
				this.max_d = max_d;
				if (min_w >= max_w)
				{
					console.error('SPARKSx.HyperCubeZone max width must be greater than min width')
					min_w = max_w -1;
				}
				this.min_w = min_w !== undefined ? min_w : 0;
				if (min_h >= max_h)
				{
					console.error('SPARKSx.HyperCubeZone max height must be greater than min height')
					min_h = max_h -1;
				}
				this.min_h = min_h !== undefined ? min_h : 0; 
				if (min_d >= max_d)
				{
					console.error('SPARKSx.HyperCubeZone max depth must be greater than min depth')
					min_d = max_d -1;
				}
				this.min_d = min_d !== undefined ? min_d : 0;
			};
			
			
			SPARKSx.HyperCubeZone.prototype.getLocation = function() {
				//TODO use pool?
			
				var location = this.position.clone();
				var _x,_y,_z
				_x  = (Math.random()-0.5) * (this.max_w - this.min_w);
				if (_x < 0) location.x += _x - this.min_w/2;
				else location.x += _x + this.min_w/2;
				
				_y  = (Math.random()-0.5) * (this.max_h - this.min_h);
				if (_y < 0) location.y += _y - this.min_h/2;
				else location.y += (_y + this.min_h/2);
				
				_z  = (Math.random()-0.5) * (this.max_d - this.min_d);
				if (_z < 0) location.z += _z - this.min_d/2;
				else location.z += (_z + this.min_d/2);
				
				return location;
				
			};
			
				*/
			
			SPARKSx.CubeZone = function(position, x, y, z) {
				this.position = position;
				this.x = x;
				this.y = y;
				this.z = z;
			};

			SPARKSx.CubeZone.prototype.getLocation = function() {
				//TODO use pool?
			
				var location = this.position.clone();
				location.x += (Math.random()-0.5) * this.x;
				location.y += (Math.random()-0.5) * this.y;
				location.z += (Math.random()-0.5) * this.z;
				
				return location;
				
			};


			/*
			Generates a point in the middle of a sphere 
			position -of the sphere
			radius - of teh sphere
			surface - if true generates a point on the surface of the sphere
			*/
			
			
			SPARKSx.SphereZone = function(position, radius,surface) {
				
				if (surface === undefined)
					this.surface = true;
				else this.surface = surface;
				
				//this.position = new THREE.Vector3();
				this.position = position;//.clone();
				this.radius = radius;
				var _r;
				var _cos_theta;
				var _sin_theta;
				var _phi;
				
				this.getLocation = function()
				{
					var location = new THREE.Vector3();
					location =this.position.clone();
					
					/* FROM Random_on_sphere.pdf;
					const float phi = 2 * PI * random();
const float cos_theta = 2 * random() - 1;
const float sin_theta = sqrt(1 - cos_theta * cos_theta);
return Vector(cos_theta, sin_theta * cos(phi), sin_theta * sin(phi));*/

					_phi =  Math.random()* Math.PI*2;
					_cos_theta = 2 * Math.random() -1;
					_sin_theta = Math.sin(1 - _cos_theta * _cos_theta);
					if (this.surface === true)
						_r = this.radius;
					else
					{
						_r =  Math.random();
						_r = Math.sqrt(_r);
						_r = _r * this.radius 
					}
						
					location.x += _r * _cos_theta;
					location.y += _r * _sin_theta *Math.cos(_phi);
					location.z += _r * _sin_theta *Math.sin(_phi);

					return location;
				}
			}
			
			/*
			A hybrid of SteadyCounter and ShotCounter
			initial - the number of particles the system starts with
			rate - the rate at which particles are emiited
			*/
			SPARKSx.HybridCounter = function(initial,rate) {
					this.particles =initial;
					this.used = false;
					this.rate = rate;
				   
					// we use a shortfall counter to make up for slow emitters 
					this.leftover = 0;
					
					this.updateEmitter = function(emitter, time) 
					{
							
						if (this.used === false)
						{
							this.used = true;
							return this.particles;
						}
							
						
						var targetRelease = time * this.rate + this.leftover;
						var actualRelease = Math.floor(targetRelease);
						
						this.leftover = targetRelease - actualRelease;
						
						return actualRelease;
					}
					
				};