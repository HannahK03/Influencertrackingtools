const bin = "624c8601fdd14a0f4680a568";
const url = "https://api.jsonbin.io/v3/b/";
const key = "$2b$10$gTsBrrcy9yDvPQwWPpuPyOshShmacvOnAwg7SxxjP6Qp27acuZKTG";
const headers = {"Content-Type": "application/json", "X-Master-Key": key};
const test = {test: "it works!"};

async function getData(id) {
	//get data stored at that id
  	try {
    	const res = await fetch(url + id, {
			method: "GET",
			headers
		});
      	const json = await res.json();
		//console.log(json);
      	return json;
    }
  	catch (e) {
    	console.error(e);
    }
}

async function putData(id, data) {
	//change data stored at that id
  	try {
    	const res = await fetch(url + id, {
        	method: "PUT",
          	headers,
          	body: JSON.stringify(data)
        });
      	const json = await res.json();
		console.log(json);
      	return json;
    }
  	catch (e) {
    	console.error(e);
    }
}

async function postData(data, update = true) {
  	//create new doll
	try {
    	const postRes = await fetch(url, {
        	method: "POST",
          	headers,
          	body: JSON.stringify(data)
        });
      	const res = await postRes.json();
		console.dir(res);
      	const id = res.metadata.id;
		console.log("id", id);
      	if (update){
            const {record} = await getData(bin);
            console.log(record);
            if (!record.items) record.items = [];
            record.items.push(id);
            const putRes = await putData(bin, record);
            console.log(putRes);
          	return putRes;
        }
    }
  	catch (e) {
    	console.error(e);
    }
}

//when the page loads, get all the doll ids from the master bin
//then create a list with data on each doll
async function createList(){
  	const main = document.querySelector("main");
  	main.innerHTML = "";
	const {record} = await getData(bin);
    //console.log(record);
  	const {items} = record; //items is list of doll ids
  	let html = "<ol>"; //"ordered list"
  	for await (const id of items) {
    	const item = await getData(id);
      	console.log(item);
      	const {name, counterWant, counterBought} = item.record;
      	html += `<li><b><a href="./#${id}">${name}</a></b>: want (${counterWant}), bought (${counterBought}) <button>Edit</button><button>Delete</button></li>`;
    }
  	html += "</ol>";
  	main.innerHTML = html; //insert list into the HTML document
  	for (let button of document.querySelectorAll("main li button:first-of-type")){
    	button.addEventListener("click", handleEdit);
    }
  	for (let button of document.querySelectorAll("main li button:last-of-type")){
    	button.addEventListener("click", handleDelete);
    }
}

async function handleEdit(e){
  	//scroll to bottom
  	window.scrollTo(0, document.body.scrollHeight);
  	//get data from storage
	const id = e.currentTarget.closest("li").querySelector("a").getAttribute("href").split("#")[1];
  	const {record} = await getData(id);
  	const {name, price, description, image} = record;
  	//populate form
  	document.querySelector("#id").value = id;
  	document.querySelector("#product_name").value = name;
  	document.querySelector("#price").value = price;
  	document.querySelector("#description").value = description;
  	document.querySelector("#imageurl").value = image;
}

async function handleDelete(e){
	if (!confirm("Delete this item?")) return;
  	const id = e.currentTarget.closest("li").querySelector("a").getAttribute("href").split("#")[1];
  	const {record} = await getData(bin);
  	record.items = record.items.filter(i => i !== id);
  	const putRes = await putData(bin, record);
	console.log(putRes);
	createList();
}

function handleFormSubmit(e){
	//this function is called when the CREATE button is clicked on the dashboard form
  	e.preventDefault();
  	const id = document.querySelector("#id").value,
          name = document.querySelector("#product_name").value.trim(),
          price = document.querySelector("#price").value.trim(),
          description = document.querySelector("#description").value.trim(),
          image = document.querySelector("#imageurl").value.trim(),
          counterWant = 0,
          counterBought = 0,
          data = {name, price, description, image, counterWant, counterBought};
  	if (!id) postData(data);
  	else putData(id, data);
  	document.querySelector("form").reset();
  	createList();
}

async function loadItem(id){
	const {record} = await getData(id);
  	const {name, price, description, image} = record;
  	document.body.dataset.id = id;
  	document.querySelector("title").textContent = name;
  	document.querySelector("h1").textContent = name;
  	document.querySelector("h2").textContent = price;
  	document.querySelector("p").textContent = description;
  	const img = document.querySelector("img");
  	img.setAttribute("src", image);
  	img.setAttribute("alt", name);
  	const [wantButton, haveButton] = document.querySelectorAll("button");
  	wantButton.addEventListener("click", handleWantClick);
  	haveButton.addEventListener("click", handleHaveClick);
}

async function handleWantClick(e){
	document.body.classList.add("submitted");
  	const id = document.body.dataset.id;
  	const {record} = await getData(id);
  	record.counterWant++;
  	const res = await putData(id, record);
}

async function handleHaveClick(e){
	document.body.classList.add("submitted");
  	const id = document.body.dataset.id;
  	const {record} = await getData(id);
  	record.counterBought++;
  	const res = await putData(id, record);
}

function init(){
	if (document.body.classList.contains("dashboard")){
      	//init for dashboard only
      	createList();
		document.querySelector("header button").addEventListener("click", createList);
      	document.querySelector("form").addEventListener("submit", handleFormSubmit);
    }
  	else {
    	//init for item pages only
      	const id = window.location.hash.slice(1); //get item id from URL
      	loadItem(id);
    }
}

init();

/*
const doll = {
	name: "Glo Up Girls Alex Doll",
  	price: "$19.99",
  	description: "With the Glo Up Girls dolls, you can transform the characters' makeup, nails, and outfits to show your glo! Each doll includes 25 surprises to be discovered rocks sporty fashions and accessories.",
    image: "https://i.postimg.cc/qBDwrmZW/alexdoll.jpg",
  	counterWant: 0,
  	counterBought: 0
};*/
