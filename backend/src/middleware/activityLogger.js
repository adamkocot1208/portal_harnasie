const { logActivity } = require('../services/logService');

const activityLogger = (action) => {
  return (req, res, next) => {
    // Zapamiętaj oryginalną funkcję res.json
    const originalJson = res.json;
    
    // Nadpisz funkcję res.json
    res.json = function(data) {
      // Wywołaj oryginalną funkcję
      originalJson.call(this, data);
      
      // Loguj tylko sukces (statusy 2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.userId; // Z middleware auth
        
        // Przygotuj opis
        let description = "";
        
        // W zależności od akcji, dostosuj opis
        switch (action) {
          case 'LOGIN':
            description = `Użytkownik zalogował się.`;
            break;
          case 'REGISTER':
            description = `Nowy użytkownik zarejestrował się.`;
            break;
          case 'PASSWORD_RESET_REQUEST':
            description = `Użytkownik zażądał resetowania hasła.`;
            break;
          case 'PASSWORD_RESET':
            description = `Użytkownik zresetował hasło.`;
            break;
          case 'PROFILE_UPDATE':
            description = `Użytkownik zaktualizował swój profil.`;
            break;
          case 'ROLE_CHANGE':
            if (data.user) {
              description = `Zmiana roli dla użytkownika ID: ${data.user.id} na: ${data.user.role}.`;
            }
            break;
          default:
            description = `Wykonano akcję: ${action}`;
        }
        
        // Zapisz log
        logActivity({
          userId,
          action,
          description,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        });
      }
    };
    
    next();
  };
};

module.exports = activityLogger;