"use strict";

// Global Variables
let params = null;
let colsEdit = null;

const colEditHtml = `
<td>
  <div class="btn-group">
    <button id="bEdit" class="btn btn-edit" onclick="rowEdit(this)"><i class="fas fa-edit"></i></button>
    <button id="bDel" class="btn btn-delete" onclick="rowDelete(this)"><i class="fas fa-trash"></i></button>
    <button id="bAccept" class="btn btn-accept" onclick="rowAccept(this)"><i class="fas fa-check"></i></button>
    <button id="bCancel" class="btn btn-cancel" onclick="rowCancel(this)"><i class="fas fa-times"></i></button>
  </div>
</td>`;

// API's calls
const getPokemon = async (pokemonName) => {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`
    );
    return response.ok
      ? await response.json()
      : console.warn("Pokemon not found: ", pokemonName);
  } catch (error) {
    console.error("There was an error finding the pokemon: ", error);
    return null;
  }
};

// Add new Row to table
const addRowToTable = async (pokemonName) => {
  const pokemonData = await getPokemon(pokemonName);
  if (!pokemonData) {
    alert("Pokemon not found. Verified name and try again.");
    return;
  }

  const tableBody = document.querySelector("#table-list tbody");
  const { sprites, name, types } = pokemonData;

  tableBody.insertAdjacentHTML(
    "beforeend",
    `
    <tr>
      <td><img src="${sprites.front_default}" alt="${name}"></td>
      <td>${name}</td>
      <td>${types.map((t) => t.type.name).join(",")}</td>
      ${colEditHtml}
    </tr>
    `
  );
};

// Initialize table
const initTable = () =>
  ["pikachu", "charmander", "bulbasaur", "squirtle"].forEach(addRowToTable);

// Set edit mode
const setEditMode = (button) => {
  const buttons = button.closest("div.btn-group").querySelectorAll("button");
  buttons.forEach(
    (btn) =>
      (btn.style.display =
        btn.id === "bAccept" || btn.id === "bCancel" ? "inline-block" : "none")
  );
  button.closest("tr").setAttribute("id", "editing");
};

// Verifies if the cell is editable
const isEditable = (index) => !colsEdit || colsEdit.includes(index);

// Edit one row of the table
const rowEdit = (button) => {
  setEditMode(button);
  button
    .closest("tr")
    .querySelectorAll("td:not([name='buttons'])")
    .forEach((td) => {
      if (isEditable(td.cellIndex)) {
        td.setAttribute("contenteditable", "true");
        td.classList.add("cell-editing");
        td.setAttribute("data-old", td.textContent);
      }
    });
};

// Set normal mode to a row
const setNormalMode = (button) => {
  const buttons = button.closest("div.btn-group").querySelectorAll("button");
  buttons.forEach(
    (btn) =>
      (btn.style.display =
        btn.id === "bEdit" || btn.id === "bDel" ? "inline-block" : "none")
  );
  button.closest("tr").removeAttribute("id");
};

// Cancel row edition
const rowCancel = (button) => {
  const row = button.closest("tr");
  row.querySelectorAll("td.cell-editing").forEach((td) => {
    td.textContent = td.getAttribute("data-old");
    td.removeAttribute("contenteditable");
    td.classList.remove("cell-editing");
  });

  setNormalMode(button);
};

// Delete table row
const rowDelete = (button) => {
  button.closest("tr").remove();
  params.onDelete();
};

// Accept, edit and confirm changes
const rowAccept = async (button) => {
  const row = button.closest("tr");
  const cells = row.querySelectorAll("td");
  const nameCell = cells[1];
  const typeCell = cells[2];

  const pokemonName = nameCell.textContent.trim().toLowerCase();

  if (!pokemonName) {
    alert("The pokemon name can't be empty. Please insert a valid name.");
    nameCell.textContent = nameCell.getAttribute("data-old");
    return;
  }
  const pokemonData = await getPokemon(pokemonName);
  if (pokemonData) {
    cells[0].innerHTML = `<img src="${pokemonData.sprites.front_default}" alt="${pokemonName}">`;
    typeCell.textContent = pokemonData.types.map((t) => t.type.name).join(", ");
  } else {
    alert("Invalid pokemon name. Please insert a valid name.");
    nameCell.textContent = nameCell.getAttribute("data-old");
    typeCell.textContent = typeCell.getAttribute("data-old");
  }

  row.querySelectorAll("td.cell-editing").forEach((td) => {
    td.removeAttribute("contenteditable");
    td.classList.remove("cell-editing");
  });

  setNormalMode(button);
  params.onEdit();
};
// Add new pokemon

const addNewRow = async (tableId) => {
  const pokemonName = prompt("Enter pokemon name");
  if (pokemonName && pokemonName.trim() !== "") {
    await addRowToTable(pokemonName);
    params.onAdd();
  } else {
    alert("Please enter a valid pokemon name");
  }
};

// Main Function to set the table as editable
const setEditTable = (options) => {
  const defaults = {
    columnsEd: null,
    addButton: null,
    onEdit: () => {},
    onBeforeDelete: () => {},
    onDelete: () => {},
    onAdd: () => {},
  };

  params = { ...defaults, ...options };
  colsEdit = params.columnsEd?.split(",").map(Number) || null;

  document.querySelectorAll("#table-list tbody tr").forEach((row) => {
    if (!row.querySelector("td[name = 'buttons']")) {
      row.insertAdjacentHTML("beforeend", colEditHtml);
    }
  });

  params.addButton?.addEventListener("click", () => addNewRow("table-list"));
};

// Initialize

document.addEventListener("DOMContentLoaded", () => {
  initTable();
  setEditTable({
    columnsEd: "1,2",
    addButton: document.getElementById("add"),
    onEdit: () => {},
    onBeforeDelete: () => {},
    onDelete: () => {},
    onAdd: () => {},
  });
});
