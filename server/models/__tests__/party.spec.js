import test from 'ava';
import request from 'supertest';
import app from '../../server';
import Party from '../party';
import { connectDB, dropDB } from '../../util/test-helpers';

// Initial partys added into test db
const partys = [
  new Party({ name: 'Prashant', title: 'Hello Mern', slug: 'hello-mern', cuid: 'f34gb2bh24b24b2', content: "All cats meow 'mern!'" }),
  new Party({ name: 'Mayank', title: 'Hi Mern', slug: 'hi-mern', cuid: 'f34gb2bh24b24b3', content: "All dogs bark 'mern!'" }),
];

test.before('connect to mockgoose', async () => {
  await connectDB();
});

test.beforeEach('connect and add two party entries', async () => {
  await Party.create(partys).catch(() => 'Unable to create partys');
});

test.afterEach.always(async () => {
  await dropDB();
});

test.serial('Should correctly give number of partys', async t => {
  t.plan(2);

  const res = await request(app)
    .get('/api/partys')
    .set('Accept', 'application/json');

  t.is(res.status, 200);
  t.deepEqual(partys.length, res.body.partys.length);
});

test.serial('Should send correct data when queried against a cuid', async t => {
  t.plan(2);

  const party = new Party({ name: 'Foo', title: 'bar', slug: 'bar', cuid: 'f34gb2bh24b24b2', content: 'Hello Mern says Foo' });
  party.save();

  const res = await request(app)
    .get('/api/partys/f34gb2bh24b24b2')
    .set('Accept', 'application/json');

  t.is(res.status, 200);
  t.is(res.body.party.name, party.name);
});

test.serial('Should correctly add a party', async t => {
  t.plan(2);

  const res = await request(app)
    .party('/api/partys')
    .send({ party: { name: 'Foo', title: 'bar', content: 'Hello Mern says Foo' } })
    .set('Accept', 'application/json');

  t.is(res.status, 200);

  const savedparty = await Party.findOne({ title: 'bar' }).exec();
  t.is(savedparty.name, 'Foo');
});

test.serial('Should correctly delete a party', async t => {
  t.plan(2);

  const party = new Party({ name: 'Foo', title: 'bar', slug: 'bar', cuid: 'f34gb2bh24b24b2', content: 'Hello Mern says Foo' });
  party.save();

  const res = await request(app)
    .delete(`/api/partys/${party.cuid}`)
    .set('Accept', 'application/json');

  t.is(res.status, 200);

  const queriedparty = await party.findOne({ cuid: party.cuid }).exec();
  t.is(queriedparty, null);
});
