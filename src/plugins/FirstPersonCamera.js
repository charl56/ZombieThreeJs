import * as THREE from 'three';

const KEYS = {
    'z': 83,
    's': 90,
    'q': 68,
    'd': 81,
};

function clamp(x, a, b) {
    return Math.min(Math.max(x, a), b);
}

export class InputController {
    constructor(target) {
        this.target_ = target || document;
        this.initialize_();
    }

    initialize_() {
        this.current_ = {
        mouseXDelta: 0,
        mouseYDelta: 0,
        mouseX: 0,
        mouseY: 0,
        };
        this.previous_ = null;
        this.keys_ = {};
        this.previousKeys_ = {};
        this.target_.addEventListener('mousemove', (e) => this.onMouseMove_(e), false);
        this.target_.addEventListener('keydown', (e) => this.onKeyDown_(e), false);
        this.target_.addEventListener('keyup', (e) => this.onKeyUp_(e), false);
    }

    onMouseMove_(e) {
        if (this.previous_ === null) {
            this.previous_ = {...this.current_};
        }
        
        this.current_.mouseXDelta = e.movementX
        this.current_.mouseYDelta = e.movementY
    }

    onKeyDown_(e) {
        this.keys_[e.keyCode] = true;
    }

    onKeyUp_(e) {
        this.keys_[e.keyCode] = false;
    }

    key(keyCode) {
        return !!this.keys_[keyCode];
    }

    update(_) {
        if (this.previous_ !== null) {
        this.current_.mouseXDelta = this.current_.mouseX - this.previous_.mouseX;
        this.current_.mouseYDelta = this.current_.mouseY - this.previous_.mouseY;

        this.previous_ = {...this.current_};
        }
    }
};

export class FirstPersonCamera {
    constructor(camera, ball) {
        this.camera_ = camera;
        this.ball_ = ball;
        this.input_ = new InputController();
        this.rotation_ = new THREE.Quaternion();
        this.translation_ = new THREE.Vector3(0, 2, 0);
        this.phi_ = 0;
        this.phiSpeed_ = 8;
        this.theta_ = 0;
        this.thetaSpeed_ = 5;
        this.playerSpeed = 7
        this.velocity_y = 0
        this.playerCanJump = true
        this.clock = new THREE.Clock()
        this.deltaTime = null
    }

    update(timeElapsedS) {
        this.updateRotation_(timeElapsedS);
        this.updateCamera_(timeElapsedS);
        this.updateTranslation_(timeElapsedS);
        this.input_.update(timeElapsedS);
    }

    updateCamera_(_) {
        // console.log(this.translation_)
        // this.ball_.userData.physicsBody.threeObject.quaternion.copy(this.rotation_);
        // this.ball_.userData.physicsBody.threeObject.position.copy(this.translation_)
        // this.ball_.userData.physicsBody.setLinearVelocity(this.translation_)


        this.ball_.quaternion.copy(this.rotation_);
        this.ball_.position.copy(this.translation_);

        
        let deltaTime = 0.0165
        // Snike : accroupi
        if(this.input_.key(20)){
            this.ball_.position.y = 1.2
        }
        // Space : jump !
        if (this.input_.key(32) && this.playerCanJump) {
            this.playerCanJump = false
            this.velocity_y = 100;
            this.ball_.position.y+=(this.velocity_y/2)*deltaTime;
        }
        this.ball_.position.y+=this.velocity_y*deltaTime;
        if(!this.playerCanJump){
            this.velocity_y-=9.8*30*deltaTime;
            if(this.ball_.position.y<=1.8){
                this.playerCanJump = true
                this.velocity_y=0;
                this.ball_.position.y= 1.8;
            }
        }
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(this.rotation_);

        const dir = forward.clone();

        forward.multiplyScalar(100);
        forward.add(this.translation_);

        let closest = forward;
        const result = new THREE.Vector3();
        const ray = new THREE.Ray(this.translation_, dir);

        this.ball_.lookAt(closest);
    }

    updateTranslation_(timeElapsedS) {
        const forwardVelocity = (this.input_.key(KEYS.z) ? 1 : 0) + (this.input_.key(KEYS.s) ? -1 : 0)
        const strafeVelocity = (this.input_.key(KEYS.q) ? 1 : 0) + (this.input_.key(KEYS.d) ? -1 : 0)

        const qx = new THREE.Quaternion();
        qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi_);

        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(qx);
        forward.multiplyScalar(forwardVelocity * timeElapsedS * this.playerSpeed);

        const left = new THREE.Vector3(-1, 0, 0);
        left.applyQuaternion(qx);
        left.multiplyScalar(strafeVelocity * timeElapsedS * this.playerSpeed);

        this.translation_.add(forward);
        this.translation_.add(left);
    }

    updateRotation_(timeElapsedS) {
        const xh = this.input_.current_.mouseXDelta / window.innerWidth;
        const yh = -(this.input_.current_.mouseYDelta / window.innerHeight);
        this.phi_ += -xh * this.phiSpeed_;
        this.theta_ = clamp(this.theta_ + -yh * this.thetaSpeed_, -Math.PI / 2, Math.PI / 2);

        const qx = new THREE.Quaternion();
        qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi_);
        const qz = new THREE.Quaternion();
        qz.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.theta_);

        const q = new THREE.Quaternion();
        q.multiply(qx);
        q.multiply(qz);

        this.rotation_.copy(q);
    }
}