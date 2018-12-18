function prepareTR(address, ether, transactions, balance) {
  return `<tr>
  <th scope="row">
    ${address}
  </th>
  <td>
    ${ether}
  </td>
  <td>
    ${transactions}
  </td>
  <td>
  <a href="/transactions/${address}" class="btn btn-sm btn-primary">See all</a>
  </td>
  </tr>`;
}

$.get('/address/all', function(data) {
  data.forEach(element => {
    $('.index-table tbody').append(prepareTR(element.address, element.balance, element.transactions.length));
  });
})


$('.search-input').keypress(function(e){
  var keyCode = e.keyCode || e.which;
  if (keyCode == '13'){
    console.log(this.value)
    window.location = '/transactions/' + this.value;
  }

})