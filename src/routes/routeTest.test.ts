import app from '@/app';
import request from 'supertest';

describe('route test', () => {
  it('should return message', (done) => {
    request(app)
      .get('/test')
      .then((response) => {
        expect(response.body).not.toBeUndefined();
        expect(response.body.message).toBe('rota teste');
        expect(response.body.message).toBe('rota teste');
        expect(response.body.data).toBeNull();
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('data');
        return done();
      });
  });
});
