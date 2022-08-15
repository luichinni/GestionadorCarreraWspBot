const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const fs = require("fs");

const path = "./materias.txt";
var aprobadas=[]; var materias=[]; 
var correlativas=[]; var aux=[];

if(fs.existsSync(path)){
    fs.readFile(path, function(err,data) {
        if(err) throw err;
        var infor = data.toString('utf-8').replace(/\r\n/g,'\n').split("\n");
        //console.log(data.toString('utf-8'));
        for(i in infor){
            //console.log(infor[i]);
            aux=infor[i].toString().split(",");
            //console.log(aux);
            aprobadas[i]=aux[0];
            //console.log(aprobadas[i]);
            materias[i]=aux[1];
            //console.log(materias[i]);
            correlativas[i]=aux[2];
            //console.log(correlativas[i]);
        }
        console.log("Plan de estudio cargado");
    });
}else{
    console.log("No existe plan de estudio");
    console.log("Generando archivo...");
    fs.writeFileSync("materias.txt",function(err){
        if(err){err};
        console.log("Archivo creado");
    });
}

const client = new Client({
    authStrategy: new LocalAuth()
})

client.on('qr', qr =>{
    qrcode.generate(qr,{small:true});
});


client.on("ready", () => {
    console.log("Bot Activo!");
});

client.on("message_create", async (msg) => {
    if (msg.fromMe) {
        if (msg.body === '.help'){
            msg.reply('🗃️Comandos:'+
            '\n🔴lista: muestra listado de materias'+
            '\n🟠cursando: muestra listado de materias que estás cursando actualmente'+
            '\n🟡aprobadas: muestra un listado de las materias aprobadas'+
            '\n🟢porcentaje: muestra el porcentaje de la carrera'+
            '\n🔵estado: cambia el estado de las materias \n_(aprobado(s),cursando(c),sin cursar o no cursada(n))_'+
            '\n🟣permitidas: muestra listado de las materias que ya podés cursar'+
            '\n🗃️Comandos para modificar el sistema:'+
            '\n⚪cargar: permite agregar materias a la lista'+
            '\n🟤quitar: permite eliminar materias de la lista');
        }else if(msg.body.startsWith('.cargar')){//cargar materias en archivo
            if(msg.body === '.cargar'){
                msg.reply('📚Ejemplo de carga: \n.cargar estado,materia,correlativas'+
                '\n📘*estado*: n/s/c'+
                '\n_(n:no cursada;s:aprobada;c:cursando)_'+
                '\n📗*materia*: nombre'+
                '\n📕*correlativas*: 1;2'+
                '\n_(si no tiene correlativa poner -1)_'+
                '\n⚠️Es importante que no hayan espacios en el entre las comas'+
                '\n.cargar c,mate 1,1;3'+
                '\n_⚠️Para ver el numero de cada materia usar .lista_');
            }else{
                var carga = msg.body.replace('.cargar ','');
                //console.log(carga);
                var arr = carga.split(',');
                //console.log(arr);
                var corr = arr[2].split(';'); var bul=true;
                //console.log(corr);
                for(i in corr){
                    if(bul){
                        if(materias.length<corr[i]){
                            bul=false;
                        }
                    }
                }
                //console.log(bul);
                if(bul){
                    //console.log("bul")
                    if(arr[0]==='n' || arr[0]==='s' || arr[0]==='c'){
                        aprobadas.push(arr[0]);
                        //console.log(aprobadas);
                        materias.push(arr[1]);
                        //console.log(materias);
                        correlativas.push(arr[2]);
                        //console.log(correlativas);
                        fs.appendFileSync(path,"\r\n"+carga);
                        //console.log("listo archivo");
                        msg.reply(arr[1]+" fue cargada exitosamente 📌");
                    }
                }else{
                    msg.reply('⛔ No se pudo cargar la materia')
                }
            }
            

        }else if(msg.body.startsWith('.quitar')){
            if(msg.body === '.quitar'){
                msg.reply('📚Ejemplo de quitar:'+
                '\n.quitar numero_materia'+
                '\n📘numero_materia: numero de la lista'+
                '\n_⚠️Para ver el numero de cada materia usar .lista_');
            }else{
                var remov=msg.body.replace('.quitar ','');
                var nremov=parseInt(remov,10);
                //console.log(nremov);
                if (nremov<=materias.length){
                    aprobadas.splice(nremov,1);
                    materias.splice(nremov,1);
                    correlativas.splice(nremov,1);
                    fs.readFile(path, function (err, data) { 
                        if (err) throw err;
                        var newFile = '';
                        for(i in materias){
                            newFile=newFile+aprobadas[i]+','+materias[i]+','+correlativas[i]+'\r\n';
                        }
                        fs.writeFile(path, newFile, "utf8", function (err) { 
                            if (err) return console.log(err); 
                            //console.log("true"); 
                        });
                    });
                    
                    
                    msg.reply('⛔ Materia eliminada');
                }else{
                    msg.reply('No existe esa materia💣');
                }
                
            }
        }else if(msg.body === '.lista'){
            var strM = '🗂️Lista de materias:\n';
            for(i in materias){
                strM = strM +'*'+i.toString()+'*: '+materias[i]+'\n';
            }
            msg.reply(strM);
        }else if(msg.body === '.cursando'){
            var strA = '⏰Cursando:\n';
            for (i in aprobadas){
                if(aprobadas[i] === 'c'){
                    strA = strA+materias[i]+'\n';
                }
            }
            if(strA==='⏰Cursando:\n'){
                msg.reply('Aun no estás cursando materias 👀');
            }else{
                msg.reply(strA);
            }
        }else if(msg.body === '.aprobadas'){
            var strAp = '✅Materias aprobadas:\n';
            for (i in aprobadas){
                if(aprobadas[i] === 's'){
                    strAp = strAp+materias[i]+'\n';
                }
            }
            if(strAp==='✅Materias aprobadas:\n'){
                msg.reply('Aun no aprobaste materias 😬');
            }else{
                msg.reply(strAp);
            }
            
        }else if(msg.body === '.porcentaje'){
            var porcen = 0.0;
            for(i in aprobadas){
                if(aprobadas[i]==='s'){
                    porcen=porcen+1;
                }
            }
            porcen=((porcen*100)/(aprobadas.length-1)).toFixed(2);
            msg.reply(`📊Porcentaje de completitud: ${porcen}%`);
        }else if(msg.body.startsWith('.estado')){
            if(msg.body === '.estado'){
                msg.reply('📚Ejemplo de actualizar:'+
                '\n.estado numero_materia,s/n/c'+
                '\n_(n:no cursada;s:aprobada;c:cursando)_'+
                '\n📘numero_materia: numero de la lista'+
                '\n_⚠️Para ver el numero de cada materia usar .lista_');
            }else{
                var tct=msg.body.replace('.estado ','');
                var remov=tct.split(',');
                var nremov=parseInt(remov[0],10);
                if (remov[1]==='s'||remov[1]==='n'||remov[1]==='c'){
                    aprobadas[nremov]=remov[1];
                    fs.readFile(path, function (err, data) { 
                        if (err) throw err;
                        var newFile = '';
                        for(i in materias){
                            newFile=newFile+aprobadas[i]+','+materias[i]+','+correlativas[i]+'\r\n';
                        }
                        fs.writeFile(path, newFile, "utf8", function (err) { 
                            if (err) return console.log(err); 
                            //console.log("true"); 
                        });
                    });
                    msg.reply(`💡${materias[nremov]} actualizada a ${aprobadas[nremov]}`);
                }else{
                    msg.reply('⛔No fue posible actualizar');
                }
                
            }
        }else if(msg.body === '.permitidas'){
            var strP = '🎉Podes cursar:\n';
            var strMat = '-1;';
            for(i in aprobadas){
                if(aprobadas[i] === 's'){
                    strMat=strMat+i+';';
                }
            }
            var corel = strMat.split(';');
            var mspl = [];
            for(i in materias){
                if(aprobadas[i]==='n'){
                    mspl = correlativas[i].split(';');
                    //console.log(mspl);
                    if(mspl.every(r=>corel.includes(r))){
                        strP=strP+materias[i]+'\n';
                    }
                }
            }
            msg.reply(strP);
        }
    }
});

client.initialize();