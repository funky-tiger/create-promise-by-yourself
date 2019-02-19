let Promise = require('./myPromise');

let p1 = ()=>{
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            resolve('success.1');
        },1000);
    });
}
let p2 = ()=>{
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            resolve('success.2');
        },1500);
    });
}
let p3 = ()=>{
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            resolve('success.3');
        },2000);
    });
}

// 异步 链式调用 finally
p1().then((data)=>{
    console.log(data);
    return 1;
}).then((data)=>{
    console.log(data);
}).finally(()=>{
    console.log('finally');
});

// all
Promise.all([p1(),p2(),p3()]).then((data)=>{
    console.log(data);
});

// race
Promise.race([p1(),p2(),p3()]).then((data)=>{
    console.log(data);
});

// resove
Promise.resolve('success').then((data)=>{
    console.log(data);
});

// reject + catch
Promise.reject('fail.').catch((err)=>{
    console.log(err);
});