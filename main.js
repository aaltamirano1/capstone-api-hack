const KEY = "AIzaSyBCcNt6OPY9co4248mzbkDYKoEIfkp21l8";

let generateEmailHtml=emails=>{
  let emailsHtml = "";
  if(emails){
    emails.forEach(email=>{
      emailsHtml += `<p><a href="mailto: ${email}">${email}</a></p>`
    });
  }
  return emailsHtml.toLowerCase();
}

let generatePhoneNumHtml=phones=>{
  let phonesHtml = "<p>";
  phones.forEach(phone=>{
    phonesHtml += phone + "<br>";
  });
  // remove <br> from last phone# and close <p>.
  return phonesHtml.slice(0, phonesHtml.length-4)+"</p>";
}

let generateAddressHtml=address=>{
  return `
    <p>${address.line1}<br>
      ${address.line2 ? address.line2+"<br>" : ""}
      ${address.line3 ? address.line3+"<br>" : ""}
      ${address.city}, ${address.state} ${address.zip}
    </p>`;
}

let generateResultHtml=result=>{
  const address = result.address ? generateAddressHtml(result.address[0]) : "";
  const phoneNumbers = result.phones ? generatePhoneNumHtml(result.phones) : "";
  const emails = result.emails ? generateEmailHtml(result.emails): "";
  
  const party = result.party ? "("+result.party+")" : "";
  
  return `
      <section role="region" tabindex="0">
        <h1 class="official-name" >${result.name} ${party}</h1>
        ${address}
        ${phoneNumbers}
        ${emails}
      </section>
    `;
}

let addVideoClipsUl=()=>{
  $('section').append(`
    <h3>Video clips of this official 
      <span class="caret" role="link">▼</span>
    </h3>
    <ul aria-live="assertive"></ul>
  `);
}

let addOfficialTitles=offices=>{
  $('section').each((i, section)=>{
    // add official title after name of the elected official.
    let html = "";
    offices.forEach(office=>{
      if(office.officialIndices.includes(i)){
        html = `<h3 class="official-title">${office.name}</h3>`;    
      }
    });
    $(section).find('h1').after(html);
  });
}

let displayCivicInfoResults=results=>{
  results.officials.forEach(result=>{
    const html = generateResultHtml(result);
    $('#results').append(html);
  });
  return results.offices;
}

let getCivicInfoData=url=>{
  fetch(url)
    .then(res=>{
      if (res.ok) {
        return res.json();
      }
      throw new Error(res.statusText);
    })
    .then(resJson=>{ 
      new Promise(function(fulfill, reject){
       fulfill(displayCivicInfoResults(resJson));
      })
      .then(offices=>{
        addOfficialTitles(offices);

        addVideoClipsUl();
        watchVideoClipsLink();
      });
    })
    .catch(err=> {
      alert(`Something went wrong: ${err.message}`);
    });
}

let generateCivicInfoUrl =searchTerm=>{
  var address = searchTerm.split(' ').join('%20');
  return `https://www.googleapis.com/civicinfo/v2/representatives?key=${KEY}&address=${address}`;
}

let watchForm=()=>{
  $('form').submit(e=>{
    e.preventDefault();
    $('#results').empty();

    var searchTerm = $('#address-input').val();
    var url = generateCivicInfoUrl(searchTerm);
    getCivicInfoData(url);
  })
}

$(watchForm);
