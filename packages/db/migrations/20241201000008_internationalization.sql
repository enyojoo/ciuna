-- Internationalization (i18n) system
-- This migration creates tables for managing multi-language content and user language preferences

-- Create languages table
CREATE TABLE languages (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL CHECK (LENGTH(code) = 2),
    name TEXT NOT NULL,
    native_name TEXT NOT NULL,
    rtl BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create translations table for dynamic content
CREATE TABLE translations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key TEXT NOT NULL,
    language_code TEXT NOT NULL REFERENCES languages(code) ON DELETE CASCADE,
    namespace TEXT NOT NULL DEFAULT 'common',
    value TEXT NOT NULL,
    context TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(key, language_code, namespace)
);

-- Create localized content table for user-generated content
CREATE TABLE localized_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content_type TEXT NOT NULL CHECK (content_type IN (
        'listing_title', 'listing_description', 'vendor_name', 'vendor_description',
        'service_title', 'service_description', 'category_name', 'category_description'
    )),
    content_id UUID NOT NULL,
    language_code TEXT NOT NULL REFERENCES languages(code) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    field_value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(content_type, content_id, language_code, field_name)
);

-- Add language preference to profiles
ALTER TABLE profiles ADD COLUMN preferred_language TEXT REFERENCES languages(code) DEFAULT 'en';
ALTER TABLE profiles ADD COLUMN timezone TEXT DEFAULT 'UTC';
ALTER TABLE profiles ADD COLUMN date_format TEXT DEFAULT 'MM/DD/YYYY';
ALTER TABLE profiles ADD COLUMN time_format TEXT DEFAULT '12h';
ALTER TABLE profiles ADD COLUMN currency_code TEXT DEFAULT 'RUB';

-- Create indexes for performance
CREATE INDEX idx_languages_code ON languages(code);
CREATE INDEX idx_languages_active ON languages(is_active);

CREATE INDEX idx_translations_key ON translations(key);
CREATE INDEX idx_translations_language ON translations(language_code);
CREATE INDEX idx_translations_namespace ON translations(namespace);
CREATE INDEX idx_translations_key_language_namespace ON translations(key, language_code, namespace);

CREATE INDEX idx_localized_content_type_id ON localized_content(content_type, content_id);
CREATE INDEX idx_localized_content_language ON localized_content(language_code);
CREATE INDEX idx_localized_content_type_language ON localized_content(content_type, language_code);

-- Add triggers for updated_at columns
CREATE TRIGGER update_languages_updated_at 
    BEFORE UPDATE ON languages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_translations_updated_at 
    BEFORE UPDATE ON translations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_localized_content_updated_at 
    BEFORE UPDATE ON localized_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert supported languages
INSERT INTO languages (code, name, native_name, rtl, is_active) VALUES
('en', 'English', 'English', FALSE, TRUE),
('ru', 'Russian', 'Русский', FALSE, TRUE),
('de', 'German', 'Deutsch', FALSE, TRUE),
('fr', 'French', 'Français', FALSE, TRUE),
('es', 'Spanish', 'Español', FALSE, TRUE),
('it', 'Italian', 'Italiano', FALSE, TRUE),
('pt', 'Portuguese', 'Português', FALSE, TRUE),
('zh', 'Chinese', '中文', FALSE, TRUE),
('ja', 'Japanese', '日本語', FALSE, TRUE),
('ko', 'Korean', '한국어', FALSE, TRUE),
('ar', 'Arabic', 'العربية', TRUE, TRUE),
('hi', 'Hindi', 'हिन्दी', FALSE, TRUE),
('tr', 'Turkish', 'Türkçe', FALSE, TRUE),
('pl', 'Polish', 'Polski', FALSE, TRUE),
('nl', 'Dutch', 'Nederlands', FALSE, TRUE);

-- Insert common translations
INSERT INTO translations (key, language_code, namespace, value) VALUES
-- Common UI elements
('common.loading', 'en', 'common', 'Loading...'),
('common.loading', 'ru', 'common', 'Загрузка...'),
('common.loading', 'de', 'common', 'Laden...'),
('common.loading', 'fr', 'common', 'Chargement...'),
('common.loading', 'es', 'common', 'Cargando...'),

('common.error', 'en', 'common', 'An error occurred'),
('common.error', 'ru', 'common', 'Произошла ошибка'),
('common.error', 'de', 'common', 'Ein Fehler ist aufgetreten'),
('common.error', 'fr', 'common', 'Une erreur s\'est produite'),
('common.error', 'es', 'common', 'Ocurrió un error'),

('common.success', 'en', 'common', 'Success'),
('common.success', 'ru', 'common', 'Успешно'),
('common.success', 'de', 'common', 'Erfolgreich'),
('common.success', 'fr', 'common', 'Succès'),
('common.success', 'es', 'common', 'Éxito'),

('common.save', 'en', 'common', 'Save'),
('common.save', 'ru', 'common', 'Сохранить'),
('common.save', 'de', 'common', 'Speichern'),
('common.save', 'fr', 'common', 'Enregistrer'),
('common.save', 'es', 'common', 'Guardar'),

('common.cancel', 'en', 'common', 'Cancel'),
('common.cancel', 'ru', 'common', 'Отмена'),
('common.cancel', 'de', 'common', 'Abbrechen'),
('common.cancel', 'fr', 'common', 'Annuler'),
('common.cancel', 'es', 'common', 'Cancelar'),

('common.delete', 'en', 'common', 'Delete'),
('common.delete', 'ru', 'common', 'Удалить'),
('common.delete', 'de', 'common', 'Löschen'),
('common.delete', 'fr', 'common', 'Supprimer'),
('common.delete', 'es', 'common', 'Eliminar'),

('common.edit', 'en', 'common', 'Edit'),
('common.edit', 'ru', 'common', 'Редактировать'),
('common.edit', 'de', 'common', 'Bearbeiten'),
('common.edit', 'fr', 'common', 'Modifier'),
('common.edit', 'es', 'common', 'Editar'),

-- Navigation
('nav.home', 'en', 'navigation', 'Home'),
('nav.home', 'ru', 'navigation', 'Главная'),
('nav.home', 'de', 'navigation', 'Startseite'),
('nav.home', 'fr', 'navigation', 'Accueil'),
('nav.home', 'es', 'navigation', 'Inicio'),

('nav.listings', 'en', 'navigation', 'Listings'),
('nav.listings', 'ru', 'navigation', 'Объявления'),
('nav.listings', 'de', 'navigation', 'Anzeigen'),
('nav.listings', 'fr', 'navigation', 'Annonces'),
('nav.listings', 'es', 'navigation', 'Anuncios'),

('nav.vendors', 'en', 'navigation', 'Vendors'),
('nav.vendors', 'ru', 'navigation', 'Продавцы'),
('nav.vendors', 'de', 'navigation', 'Verkäufer'),
('nav.vendors', 'fr', 'navigation', 'Vendeurs'),
('nav.vendors', 'es', 'navigation', 'Vendedores'),

('nav.services', 'en', 'navigation', 'Services'),
('nav.services', 'ru', 'navigation', 'Услуги'),
('nav.services', 'de', 'navigation', 'Dienstleistungen'),
('nav.services', 'fr', 'navigation', 'Services'),
('nav.services', 'es', 'navigation', 'Servicios'),

('nav.sell', 'en', 'navigation', 'Sell'),
('nav.sell', 'ru', 'navigation', 'Продать'),
('nav.sell', 'de', 'navigation', 'Verkaufen'),
('nav.sell', 'fr', 'navigation', 'Vendre'),
('nav.sell', 'es', 'navigation', 'Vender'),

('nav.inbox', 'en', 'navigation', 'Inbox'),
('nav.inbox', 'ru', 'navigation', 'Входящие'),
('nav.inbox', 'de', 'navigation', 'Posteingang'),
('nav.inbox', 'fr', 'navigation', 'Boîte de réception'),
('nav.inbox', 'es', 'navigation', 'Bandeja de entrada'),

('nav.orders', 'en', 'navigation', 'Orders'),
('nav.orders', 'ru', 'navigation', 'Заказы'),
('nav.orders', 'de', 'navigation', 'Bestellungen'),
('nav.orders', 'fr', 'navigation', 'Commandes'),
('nav.orders', 'es', 'navigation', 'Pedidos'),

('nav.profile', 'en', 'navigation', 'Profile'),
('nav.profile', 'ru', 'navigation', 'Профиль'),
('nav.profile', 'de', 'navigation', 'Profil'),
('nav.profile', 'fr', 'navigation', 'Profil'),
('nav.profile', 'es', 'navigation', 'Perfil'),

-- Authentication
('auth.signin', 'en', 'auth', 'Sign In'),
('auth.signin', 'ru', 'auth', 'Войти'),
('auth.signin', 'de', 'auth', 'Anmelden'),
('auth.signin', 'fr', 'auth', 'Se connecter'),
('auth.signin', 'es', 'auth', 'Iniciar sesión'),

('auth.signup', 'en', 'auth', 'Sign Up'),
('auth.signup', 'ru', 'auth', 'Регистрация'),
('auth.signup', 'de', 'auth', 'Registrieren'),
('auth.signup', 'fr', 'auth', 'S\'inscrire'),
('auth.signup', 'es', 'auth', 'Registrarse'),

('auth.signout', 'en', 'auth', 'Sign Out'),
('auth.signout', 'ru', 'auth', 'Выйти'),
('auth.signout', 'de', 'auth', 'Abmelden'),
('auth.signout', 'fr', 'auth', 'Se déconnecter'),
('auth.signout', 'es', 'auth', 'Cerrar sesión'),

('auth.email', 'en', 'auth', 'Email'),
('auth.email', 'ru', 'auth', 'Электронная почта'),
('auth.email', 'de', 'auth', 'E-Mail'),
('auth.email', 'fr', 'auth', 'E-mail'),
('auth.email', 'es', 'auth', 'Correo electrónico'),

('auth.password', 'en', 'auth', 'Password'),
('auth.password', 'ru', 'auth', 'Пароль'),
('auth.password', 'de', 'auth', 'Passwort'),
('auth.password', 'fr', 'auth', 'Mot de passe'),
('auth.password', 'es', 'auth', 'Contraseña'),

-- Marketplace
('marketplace.search', 'en', 'marketplace', 'Search...'),
('marketplace.search', 'ru', 'marketplace', 'Поиск...'),
('marketplace.search', 'de', 'marketplace', 'Suchen...'),
('marketplace.search', 'fr', 'marketplace', 'Rechercher...'),
('marketplace.search', 'es', 'marketplace', 'Buscar...'),

('marketplace.categories', 'en', 'marketplace', 'Categories'),
('marketplace.categories', 'ru', 'marketplace', 'Категории'),
('marketplace.categories', 'de', 'marketplace', 'Kategorien'),
('marketplace.categories', 'fr', 'marketplace', 'Catégories'),
('marketplace.categories', 'es', 'marketplace', 'Categorías'),

('marketplace.price', 'en', 'marketplace', 'Price'),
('marketplace.price', 'ru', 'marketplace', 'Цена'),
('marketplace.price', 'de', 'marketplace', 'Preis'),
('marketplace.price', 'fr', 'marketplace', 'Prix'),
('marketplace.price', 'es', 'marketplace', 'Precio'),

('marketplace.currency', 'en', 'marketplace', 'Currency'),
('marketplace.currency', 'ru', 'marketplace', 'Валюта'),
('marketplace.currency', 'de', 'marketplace', 'Währung'),
('marketplace.currency', 'fr', 'marketplace', 'Devise'),
('marketplace.currency', 'es', 'marketplace', 'Moneda'),

-- Create RLS policies
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE localized_content ENABLE ROW LEVEL SECURITY;

-- Languages: public read access
CREATE POLICY "Languages are publicly readable" ON languages
    FOR SELECT USING (is_active = true);

-- Translations: public read access
CREATE POLICY "Translations are publicly readable" ON translations
    FOR SELECT USING (true);

-- Localized content: public read access
CREATE POLICY "Localized content is publicly readable" ON localized_content
    FOR SELECT USING (true);

-- Create functions for i18n
CREATE OR REPLACE FUNCTION get_translation(
    p_key TEXT,
    p_language_code TEXT DEFAULT 'en',
    p_namespace TEXT DEFAULT 'common'
) RETURNS TEXT AS $$
DECLARE
    translation_value TEXT;
BEGIN
    SELECT value INTO translation_value
    FROM translations
    WHERE key = p_key 
    AND language_code = p_language_code 
    AND namespace = p_namespace;
    
    -- Fallback to English if translation not found
    IF translation_value IS NULL AND p_language_code != 'en' THEN
        SELECT value INTO translation_value
        FROM translations
        WHERE key = p_key 
        AND language_code = 'en' 
        AND namespace = p_namespace;
    END IF;
    
    RETURN COALESCE(translation_value, p_key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_localized_content(
    p_content_type TEXT,
    p_content_id UUID,
    p_language_code TEXT DEFAULT 'en',
    p_field_name TEXT
) RETURNS TEXT AS $$
DECLARE
    content_value TEXT;
BEGIN
    SELECT field_value INTO content_value
    FROM localized_content
    WHERE content_type = p_content_type 
    AND content_id = p_content_id 
    AND language_code = p_language_code 
    AND field_name = p_field_name;
    
    -- Fallback to English if translation not found
    IF content_value IS NULL AND p_language_code != 'en' THEN
        SELECT field_value INTO content_value
        FROM localized_content
        WHERE content_type = p_content_type 
        AND content_id = p_content_id 
        AND language_code = 'en' 
        AND field_name = p_field_name;
    END IF;
    
    RETURN content_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION set_localized_content(
    p_content_type TEXT,
    p_content_id UUID,
    p_language_code TEXT,
    p_field_name TEXT,
    p_field_value TEXT
) RETURNS UUID AS $$
DECLARE
    content_id UUID;
BEGIN
    INSERT INTO localized_content (
        content_type, content_id, language_code, field_name, field_value
    ) VALUES (
        p_content_type, p_content_id, p_language_code, p_field_name, p_field_value
    )
    ON CONFLICT (content_type, content_id, language_code, field_name)
    DO UPDATE SET 
        field_value = EXCLUDED.field_value,
        updated_at = NOW()
    RETURNING id INTO content_id;
    
    RETURN content_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
