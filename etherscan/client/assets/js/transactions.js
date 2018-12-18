function prepareTR(block, from, to, ether, status) {
  return `<tr>
  <th scope="row">
    ${block}
  </th>
  <td>
    ${from}
  </td>
  <td>
    ${to}
  </td>
  <td>
    ${ether}
  </td>
  <td>
    ${status}
  </td>
  </tr>`;
}

var address = window.location.pathname.split('/').pop();

$('.transactions-table tbody').text('Loading...');

$.get('/ether/' + address, function(data) {

  if (data !== "Invalid Address.") {
    $('.transactions-table tbody').text('');
    data.transactions.forEach(function(transaction){
      if (transaction.isError === "0") {
        status = "Success";
      } else {
        status = "Failure";
      }
      var tr = prepareTR(transaction.blockNumber, transaction.from, transaction.to, transaction.ether, status)
      $('.transactions-table tbody').append(tr);

    });
  }

  $('.transactions-table tbody').append(data);
})