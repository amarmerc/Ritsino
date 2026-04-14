-- ============================================
-- RITSINO — Seed: Universidades españolas con Ingeniería Informática
-- ============================================

INSERT INTO universities (acronym, full_name) VALUES
-- Andalucía
('UPO', 'Universidad Pablo de Olavide'),
('US', 'Universidad de Sevilla'),
('UGR', 'Universidad de Granada'),
('UMA', 'Universidad de Málaga'),
('UCA', 'Universidad de Cádiz'),
('UCO', 'Universidad de Córdoba'),
('UJA', 'Universidad de Jaén'),
('UAL', 'Universidad de Almería'),
('UHU', 'Universidad de Huelva'),
-- Madrid
('UCM', 'Universidad Complutense de Madrid'),
('UAM', 'Universidad Autónoma de Madrid'),
('UPM', 'Universidad Politécnica de Madrid'),
('URJC', 'Universidad Rey Juan Carlos'),
('UC3M', 'Universidad Carlos III de Madrid'),
('UAH', 'Universidad de Alcalá'),
-- Cataluña
('UPC', 'Universitat Politècnica de Catalunya'),
('UAB', 'Universitat Autònoma de Barcelona'),
('UB', 'Universitat de Barcelona'),
('UPF', 'Universitat Pompeu Fabra'),
('UdG', 'Universitat de Girona'),
('UdL', 'Universitat de Lleida'),
('URV', 'Universitat Rovira i Virgili'),
-- Comunidad Valenciana
('UPV', 'Universitat Politècnica de València'),
('UV', 'Universitat de València'),
('UJI', 'Universitat Jaume I'),
('UA', 'Universidad de Alicante'),
('UMH', 'Universidad Miguel Hernández'),
-- Castilla y León
('USAL', 'Universidad de Salamanca'),
('UVA', 'Universidad de Valladolid'),
('UBU', 'Universidad de Burgos'),
('ULE', 'Universidad de León'),
-- Aragón
('UNIZAR', 'Universidad de Zaragoza'),
-- Extremadura
('UNEX', 'Universidad de Extremadura'),
-- Castilla-La Mancha
('UCLM', 'Universidad de Castilla-La Mancha'),
-- Murcia
('UM', 'Universidad de Murcia'),
('UPCT', 'Universidad Politécnica de Cartagena'),
-- Galicia
('USC', 'Universidade de Santiago de Compostela'),
('UDC', 'Universidade da Coruña'),
('UVIGO', 'Universidade de Vigo'),
-- Cantabria
('UNICAN', 'Universidad de Cantabria'),
-- País Vasco
('UPV/EHU', 'Universidad del País Vasco'),
-- Navarra
('UNAV', 'Universidad de Navarra'),
('UPNA', 'Universidad Pública de Navarra'),
-- Asturias
('UNIOVI', 'Universidad de Oviedo'),
-- Canarias
('ULPGC', 'Universidad de Las Palmas de Gran Canaria'),
('ULL', 'Universidad de La Laguna'),
-- Baleares
('UIB', 'Universitat de les Illes Balears'),
-- Online
('UNIR', 'Universidad Internacional de La Rioja'),
('UOC', 'Universitat Oberta de Catalunya'),
('UDIMA', 'Universidad a Distancia de Madrid')
ON CONFLICT (acronym) DO NOTHING;
