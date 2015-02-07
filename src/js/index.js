import hogan from 'hogan.js';
import SC from './sound-cloud';

var sc = SC('739b39925c3cc275aeb03837ff27762c');

sc.userID('paulcpederson')
  .then(user => sc.favorites(user.id))
  .then(favorites => console.log(favorites))
  .catch(err => console.error('Something went wrong', err));

// compile template
var $users = document.getElementById('users');
var template = hogan.compile($users.innerHTML);
var users = [{ name: 'bob' }, { name: 'jill' }, { name: 'mary' }, { name: 'james' }];
$users.innerHTML = template.render({users: users});