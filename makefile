# Компилятор и флаги
CXX := g++
CXXFLAGS := -g -Wall -std=c++11 -static
LDFLAGS := -lws2_32 -lssl -lcrypto -ladvapi32

# Пути
INCLUDE_DIRS := -I"C:/Program Files/MySQL/MySQL Server 8.0/include" -I"../lib"
LIB_DIRS := -L"C:/Program Files/MySQL/MySQL Server 8.0/lib"
LIBS := "C:/Program Files/MySQL/MySQL Server 8.0/lib/libmysql.lib"

# Файлы и цели
SRC_DIR := src
BUILD_DIR := bin
SRC_FILES := $(SRC_DIR)/main.cpp
TARGET := $(BUILD_DIR)/my_server.exe

# Основная цель
all: $(TARGET)

# Компиляция сервера
$(TARGET): $(SRC_FILES)
	@echo "🔨 Компиляция сервера..."
	$(CXX) $(CXXFLAGS) $(INCLUDE_DIRS) $(SRC_FILES) -o $(TARGET) $(LIB_DIRS) $(LIBS) $(LDFLAGS)
	@echo "✅ Сервер успешно скомпилирован: $(TARGET)"

# Запуск сервера
run: $(TARGET)
	@echo "🚀 Запуск сервера..."
	./$(TARGET)

# Очистка бинарных файлов
clean:
	@echo "🧹 Очистка бинарных файлов..."
	rm -f $(TARGET)
	@echo "✅ Очистка завершена"

# Отладочная сборка
debug: CXXFLAGS += -DDEBUG -O0
debug: $(TARGET)

# Профилировочная сборка  
release: CXXFLAGS += -O2 -DNDEBUG
release: $(TARGET)

# Показать информацию о компиляции
info:
	@echo "📋 Информация о сборке:"
	@echo "Компилятор: $(CXX)"
	@echo "Флаги: $(CXXFLAGS)"
	@echo "Исходники: $(SRC_FILES)"
	@echo "Цель: $(TARGET)"

# Помощь
help:
	@echo "Доступные команды:"
	@echo "  make all     - Сборка проекта (по умолчанию)"
	@echo "  make run     - Сборка и запуск сервера"
	@echo "  make clean   - Очистка бинарных файлов"
	@echo "  make debug   - Сборка с отладочными флагами"
	@echo "  make release - Сборка с оптимизацией"
	@echo "  make info    - Показать информацию о сборке"
	@echo "  make help    - Показать эту справку"

.PHONY: all run clean debug release info help