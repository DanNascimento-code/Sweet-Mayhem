import kuromiIdle from '../images/characters/kuromi-idle-v2.png'

function KuromiCharacter({ placement }) {
  const accessibleDescription =
    placement === 'start'
      ? 'Kuromi apresentando o jogo'
      : 'Kuromi observando o tabuleiro'

  return (
    <div
      className="kuromi-character"
      data-placement={placement}
      data-reaction="idle"
      role="img"
      aria-label={accessibleDescription}
    >
      <img src={kuromiIdle} alt="" draggable="false" />
    </div>
  )
}

export default KuromiCharacter
