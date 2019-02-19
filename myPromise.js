function Promise(executor){
    let self = this;
    self.status = 'pending';
    self.value = undefined;
    self.reason = undefined;
    self.onFulfilledCallbacks = [];
    self.onRejectCallbacks = [];
    function resolve(value){
        if(self.status === 'pending'){
            self.value = value;
            self.status = 'resolved';
            self.onFulfilledCallbacks.forEach((fn)=>{
                fn();
            });
        }
    }
    function reject(reason){
        if(self.status === 'pending'){
            self.reason = reason;
            self.status = 'rejected';
            self.onRejectCallbacks.forEach((fn)=>{
                fn();
            });
        }
    }   
    try{
        executor(resolve,reject);
    }catch(e){
        reject(e);
    }
}

Promise.prototype.then = function(onFulfilled,onRejected){
    onFulfilled = typeof onFulfilled === 'function'?onFulfilled:value=>value;
    onRejected = typeof onRejected === 'function'?onRejected:err=>{throw err};
    let self = this;
    let promise2 = new Promise((resolve, reject)=>{
        if(self.status === 'resolved'){
            setTimeout(()=>{
                try{
                    let x = onFulfilled(self.value);
                    // 判断then的返回值x是不是一个promise
                    resolvePromise(promise2,x,resolve,reject);
                }catch(e){
                    reject(e);
                };
            },0);
        }
        if(self.status === 'rejected'){
            setTimeout(()=>{
                try{
                    let x = onRejected(self.reason);
                    resolvePromise(promise2,x,resolve,reject);
                }catch(e){
                    reject(e);
                };
            },0);
        }
        if(self.status === 'pending'){
            self.onFulfilledCallbacks.push(function(){
                setTimeout(()=>{
                    try{
                        let x = onFulfilled(self.value);
                        resolvePromise(promise2,x,resolve,reject);
                    }catch(e){
                        reject(e);
                    };
                },0);
            });
            self.onRejectCallbacks.push(function(){
                setTimeout(()=>{
                    try{
                        let x = onRejected(self.reason);
                        // 判断then的返回值x是不是一个promise
                        resolvePromise(promise2,x,resolve,reject);
                    }catch(e){
                        reject(e);
                    };
                },0);
            });
        }
    });
    return promise2;
}

function resolvePromise(promise2,x,resolve,reject){
    if(promise2 == x){
        return reject(new TypeError('循环引用啦.'));
    }
    let called;
    // x是引用类型 继续深入判断
    if(x!==null&&(typeof x === 'object' || typeof x === 'function')){
            try{
                let then = x.then;
                if(typeof then === 'function'){
                    then.call(x,(y)=>{
                        if(called) return;
                        called = true;
                        // resolvePromise(promise2,y,resolve,reject);
                        resolvePromise(x,y,resolve,reject);
                    },(r)=>{
                        if(called) return;
                        called = true;
                        reject(r);
                    });
                }else{
                    // x是普通对象 直接返回到resolve中.
                    resolve(x);
                }
            }catch(e){
                if(called) return;
                called = true;
                reject(e);
            }
    }else{
        // x是常量 直接返回到resolve中.
        resolve(x);
    }
}

// catch方法本质上就是then方法
Promise.prototype.catch = function(errfn){
    return this.then(null,errfn);
}

Promise.prototype.finally = function(fn){
    this.then(()=>{
        fn();
    },()=>{
        fn();
    });
    return this;
}

Promise.all = function(values){
    return new Promise((resolve,reject)=>{
        let arr = [];
        let index = 0;
        function progressData(key,value){
            index++;
            arr[key] = value;
            if(index === values.length){
                resolve(arr);
            }
        }
        for(let i = 0; i < values.length; i++){
            let current = values[i];
            if(current && current.then && typeof current.then === 'function'){
                // 如果是then
                current.then((y)=>{
                    progressData(i,y);
                },reject);
            }else{
            // 如果是常量
                progressData(i,current);
            }
        }
    });
}

Promise.race = function(values){
    return new Promise((resolve,reject)=>{
        for(let i = 0; i < values.length; i++){
            let current = values[i];
            if(current && current.then && typeof current.then == 'function'){
                // 有一个执行成功 race方法就resolve成功
                current.then(resolve,reject);
            }else{
                resolve(current);
            }
        }
    });
}

Promise.resolve = function(value){
    return new Promise((resolve,reject)=>{
        resolve(value);
    });
}

Promise.reject = function(reason){
    return new Promise((resolve,reject)=>{
        reject(reason);
    });
}
// 实现一个promise的延迟对象 defer
Promise.defer = Promise.deferred = function(){
    let dfd = {};
    dfd.promise = new Promise((resolve, reject)=>{
        dfd.resolve = resolve;
        dfd.reject = reject;
    });
    return dfd;
}

module.exports = Promise;