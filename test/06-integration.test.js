import session from 'supertest'
import app from '../src/server.js'
const agent = session(app);
import * as help from './helperTest/IntegrationTest(06).js'
import * as store from './helperTest/testStore.js';


describe('Test de rutas Usuario, Project.', ()=>{
    // afterAll(()=>{
    //     console.log('Finalizando todas las pruebas...')
     
    // })
    describe('Test de rutas de usuario: "/api/user": ', ()=>{
        describe('Ruta "user/create": Ruta de creacion de usuario', ()=>{
            it('Deberia responder con status 201 y retornar el usuario', async()=>{
                const email = "josenomeacuerdo@hotmail.com";
                const password = 'L1234567'
                const response = await agent
                .post('/api/user/create')
                .send({email, password})
                .expect('Content-Type', /json/)
                .expect(201);
                expect(response.body).toEqual(help.userCreated)
                store.setUserId(response.body.id)
            })
            it('Deberia responder con status 400 si faltan parametros', async()=>{
                const email = "josenomeacuerdo@hotmail.com";
                const password = ''
                const response = await agent
                .post('/api/user/create')
                .send({email, password})
                .expect('Content-Type', /json/)
                .expect(400);
                expect(response.body).toEqual({error: "missing password"})
            })
        })
        describe('Ruta "user/login": Ruta de validacion de usuario', ()=>{
            it('Deberia responder con status 200 y retornar el usuario con el token', async()=>{
                const email = "josenomeacuerdo@hotmail.com";
                const password = 'L1234567'
                const response = await agent
                .post('/api/user/login')
                .send({email, password})
                .expect('Content-Type', /json/)
                .expect(200);
                expect(response.body).toEqual(help.userLogged)
                store.setToken(response.body.token)
            })
            it('Deberia responder con status 400 si faltan parametros', async()=>{
                const email = "josenomeacuerdo@hotmail.com";
                const password = ''
                const response = await agent
                .post('/api/user/login')
                .send({email, password})
                .expect('Content-Type', /json/)
                .expect(400);
                expect(response.body).toEqual({error: "missing password"})
            })
        });
        describe('Rutas "/user", "/user/:id: Rutas protegidas por token', ()=>{
            it('Ruta "user": Deberia responder con status 200 y retornar un array de usuarios', async()=>{
                const token = store.getToken(); 
                const response = await agent
                  .get('/api/user')
                  .set('Authorization', `Bearer ${token}`)
                  .expect(200);
                expect(response.body).toEqual(help.protecUsers);
            })
            it('Deberia arrojar un error 401 si el token no estuviera presente', async()=>{
                const response = await agent
                .get('/api/user')
                .expect(401);
                expect(response.body).toEqual({error: 'Acceso no autorizado. Token no proporcionado'});
            })
            it('Ruta "/user/:id": Deberia responder con status 200 y retornar un usuario', async()=>{
                const token = store.getToken(); 
                const userId = store.getUserId()
                const response = await agent
                  .get(`/api/user/${userId}`)
                  .set('Authorization', `Bearer ${token}`)
                  .expect(200);
                  expect(response.body).toEqual(help.protecUser);
            })
            it('Deberia arrojar un error 401 si el token no fuera el correcto', async()=>{
                const userId = store.getUserId()
                const response = await agent
                .get(`/api/user/${userId}`)
                .set('Authorization', `Bearer 'eyW9yb2RyaWd1ZXp0a2RAZ21haWwuY29tIiwicmeHAiOjE3MTk2OTI3MjZ9.7Onxx2MjQdeJF-KccG'`)
                .expect(401);
                expect(response.body).toEqual({error: 'Token invalido'});
            })
        })
        describe('Ruta "/user/:id" actualizacion de usuario (ruta protegida con token).', ()=>{
            it('Deberia recibir un status 200 al actualizar un usuario con exito', async()=>{
                const userId = store.getUserId();
                const newData = help.newUser;
                const token = store.getToken()
                const response = await agent
                .put(`/api/user/${userId}`)
                .send(newData)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
                expect(response.body).toMatchObject(help.updatedUser)
            })
            it('Deberia arrojar un status 400 si faltaran parametros', async()=>{
                const userId = store.getUserId();
                const token = store.getToken()
                const response = await agent
                .put(`/api/user/${userId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(400);
                expect(response.body).toEqual({ error: 'Missing body' })
            })
        })
        describe('Ruta "/user/sec" de verificacion de password', ()=>{
            it('Deberia retornar un status 200 y un mensaje de verificacion aprobada', async()=>{
                const id = store.getUserId();
                const password = 'L1234567';
                const token = store.getToken()
                const response = await agent
                .post(`/api/user/sec`)
                .send({id,  password})
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
                expect(response.body).toEqual({ message: "Password successfully verified" })
            })
            it('Deberia retornar un status 401 y un mensaje de error por falta de validacion.', async()=>{
                const id = store.getUserId();
                const password = 'L1234567';
                const token = store.getToken()
                const response = await agent
                .post(`/api/user/sec`)
                .send({id,  password})
                .expect(401);
                expect(response.body).toEqual({error: 'Acceso no autorizado. Token no proporcionado'})
            })
        })
        describe('Ruta "/user/sec/:id" de actualizacion de password', ()=>{
            it('Deberia retornar un status 200 y un mensaje de actualizacion exitosa', async()=>{
                const id = store.getUserId();
                const password = 'L1234567';
                const token = store.getToken()
                const response = await agent
                .patch(`/api/user/sec/${id}`)
                .send({password})
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
                expect(response.body).toBe("Password updated successfully")
            })
            it('Deberia retornar un status 401 y un mensaje error por token invalido', async()=>{
                const id = store.getUserId();
                const password = 'L1234567';
                const token = 'asoifasdofisadoifasdoifjsoadfi'
                const response = await agent
                .patch(`/api/user/sec/${id}`)
                .send({password})
                .set('Authorization', `Bearer ${token}`)
                .expect(401);
                expect(response.body).toEqual({error: 'Token invalido'})
            })
        })
        describe('Test de rutas Project: "/api/project": ', ()=>{})
    })
})
