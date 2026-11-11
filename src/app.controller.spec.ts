import { AppController } from './app.controller.js';

describe('AppController', () => {
  it('returns API health information', () => {
    const controller = new AppController();
    expect(controller.health()).toEqual({
      name: 'Delivery App API',
      status: 'ok',
      version: '1.0.0',
    });
  });
});
