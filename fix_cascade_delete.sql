-- Eliminar la restricción actual que impide borrar locales con votos
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_locale_id_fkey;
-- Añadir la restricción nuevamente pero con la propiedad ON DELETE CASCADE
-- Esto significa: "Si borro un local, borra automáticamente todos sus votos"
ALTER TABLE votes
ADD CONSTRAINT votes_locale_id_fkey FOREIGN KEY (locale_id) REFERENCES locales(id) ON DELETE CASCADE;