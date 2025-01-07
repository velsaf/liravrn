document.addEventListener("DOMContentLoaded", function () {
  const tabButtons = document.querySelectorAll(".tab-button");
  const placesList = document.getElementById("places-list");
  const articlesContainer = document.getElementById("articles");
  const searchInput = document.getElementById("search");
  const filterOptions = document.querySelectorAll(".filter-options input");

  // Элементы модального окна
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modal-title");
  const modalDescription = document.getElementById("modal-description");
  const modalAddress = document.getElementById("modal-address");
  const closeModal = document.querySelector(".close");

  // Инициализация карты
  const map = L.map("map").setView([51.6616, 39.2003], 13); // Центр на Воронеже
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  // Загрузка данных из JSON
  let articlesData = [];
  fetch("data.json")
    .then((response) => response.json())
    .then((data) => {
      articlesData = data;
      renderPlaces(data); // Рендерим список мест при загрузке
      addMarkersToMap(data);
    })
    .catch((error) => console.error("Ошибка загрузки данных:", error));

  // Рендер списка мест
  function renderPlaces(data) {
    placesList.innerHTML = "";
    data.forEach((item) => {
      const place = document.createElement("div");
      place.classList.add("place-item");
      place.innerHTML = `
        <h3>${item.title}</h3>
        <p><strong>Адрес:</strong> ${item.address}</p>
      `;
      place.addEventListener("click", () => {
        map.setView([item.lat, item.lng], 15); // Центрируем карту на выбранном месте
      });
      placesList.appendChild(place);
    });
  }

  // Рендер статей
  function renderArticles(data) {
    articlesContainer.innerHTML = "";
    data.forEach((item) => {
      const article = document.createElement("div");
      article.classList.add("article");
      article.innerHTML = `
        <img src="https://via.placeholder.com/600x400" alt="Заглушка" class="placeholder">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <p><strong>Адрес:</strong> ${item.address}</p>
        <a href="#" class="read-more" data-id="${item.title}">Читать подробнее</a>
      `;
      articlesContainer.appendChild(article);
    });

    // Добавляем обработчики для кнопок "Читать подробнее"
    const readMoreButtons = document.querySelectorAll(".read-more");
    readMoreButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const item = articlesData.find((article) => article.title === button.dataset.id);
        if (item) {
          openModal(item);
        }
      });
    });
  }

  // Открытие модального окна
  function openModal(item) {
    modalTitle.textContent = item.title;
    modalDescription.textContent = item.description;
    modalAddress.textContent = item.address;
    modal.style.display = "flex";
  }

  // Закрытие модального окна
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Закрытие модального окна при клике вне его
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // Добавление маркеров на карту
  function addMarkersToMap(data) {
    data.forEach((item) => {
      const marker = L.marker([item.lat, item.lng]).addTo(map);
      marker.bindPopup(`<b>${item.title}</b><br>${item.address}`);
    });
  }

  // Переключение вкладок
  function switchTab(tab) {
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    tab.classList.add("active");

    if (tab.dataset.tab === "articles") {
      placesList.classList.remove("active");
      articlesContainer.classList.add("active");
      renderArticles(articlesData);
    } else {
      articlesContainer.classList.remove("active");
      placesList.classList.add("active");
      renderPlaces(articlesData);
    }
  }

  // Изначальная активация вкладки "Карта"
  const initialTab = document.querySelector('.tab-button[data-tab="map"]');
  switchTab(initialTab);

  // Обработчики для переключения вкладок
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => switchTab(button));
  });

  // Фильтрация данных
  function filterData() {
    const searchText = searchInput.value.toLowerCase();
    const selectedFilters = Array.from(filterOptions)
      .filter((option) => option.checked)
      .map((option) => option.value);

    const filteredData = articlesData.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchText) ||
                            item.description.toLowerCase().includes(searchText);
      const matchesFilters = selectedFilters.length === 0 || selectedFilters.includes(item.type);
      return matchesSearch && matchesFilters;
    });

    if (articlesContainer.classList.contains("active")) {
      renderArticles(filteredData);
    } else {
      renderPlaces(filteredData);
    }
  }

  searchInput.addEventListener("input", filterData);
  filterOptions.forEach((option) => option.addEventListener("change", filterData));
});
